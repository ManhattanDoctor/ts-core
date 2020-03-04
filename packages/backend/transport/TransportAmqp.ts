import { ExtendedError } from '@ts-core/common/error';
import { ILogger } from '@ts-core/common/logger';
import { PromiseHandler } from '@ts-core/common/promise';
import {
    ITransportCommand,
    ITransportCommandAsync,
    ITransportCommandOptions,
    ITransportEvent,
    Transport,
    TransportCommand,
    TransportCommandAsync,
    TransportEvent,
    TransportLogType,
    TransportTimeoutError,
    TransportWaitError
} from '@ts-core/common/transport';
import * as amqp from 'amqplib';
import { Channel, Message, Options, Replies } from 'amqplib';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import * as uuid from 'uuid';
import { IAmqpSettings } from '../settings/IAmqpSettings';
import { TransportInvalidHeadersError } from './TransportInvalidHeadersError';

export class TransportAmqp extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DELAY_TTL = 500;
    public static RECONNECT_DELAY = 1000;
    public static CONNECTION_TIMEOUT = 120000;
    public static EVENT_CONSUMER = 'GATEWAY_EVENT_CONSUMER';
    public static EVENT_EXCHANGE = 'GATEWAY_EVENT_EXCHANGE';
    public static REPLY_POSTFIX = '.REPLY';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private channel: Channel;

    private asserts: Set<string>;
    private messages: Map<string, Message>;
    private listening: Set<string>;
    private consumes: Map<string, string>;
    private replyQueue: Map<string, string>;
    private delayAsserts: Set<string>;

    private eventQueueName: string;
    private subscribedEvent: Map<string, Subject<any>>;

    private _connection: amqp.Connection;
    private connectionPromise: Promise<void>;
    private connectionIPromise: PromiseHandler;

    private connectionTimeout: NodeJS.Timeout;
    private connectionAttempts: number = 0;

    private isEventQueueAssert = false;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, private settings: IAmqpSettings) {
        super(logger);

        this.asserts = new Set();
        this.delayAsserts = new Set();
        this.messages = new Map();
        this.listening = new Set();
        this.consumes = new Map();
        this.replyQueue = new Map();
        this.subscribedEvent = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async connect(): Promise<void> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionIPromise = PromiseHandler.create();
        this.connectionPromise = this.connectionIPromise.promise;
        await this.reconnect();

        return this.connectionPromise;
    }

    public async disconnect(): Promise<void> {
        this.unsubscribeListeners();
        let promises = [];
        this.consumes.forEach(async (key, value) => {
            let promise = new Promise((resolve, reject) => {
                let cancelResult = this.channel.cancel(value);
                if (!cancelResult) {
                    resolve();
                } else {
                    cancelResult
                        .then(() => {
                            resolve();
                        })
                        .catch(error => {
                            this.error(`Channel closed ${error.message}`);
                            reject();
                        });
                }
            });
            promises.push(promise);
            this.consumes.delete(key);
        });

        await Promise.all(promises);
        await this.connection.close();
    }

    public send<U>(command: ITransportCommand<U>): void {
        if (_.isNil(command.request)) {
            throw new ExtendedError(`${command.name} command request is null or undefined`);
        }

        this.logCommand(command, TransportLogType.REQUEST_NO_REPLY);
        this.sendToQueue(command, this.createCommandOptions(command, false));
    }

    private createCommandOptions<U>(command: ITransportCommand<U>, isNeedReply: boolean, options?: ITransportCommandOptions): ICommandOptions {
        if (_.isNil(options)) {
            options = {};
        }

        let expiration = _.isNumber(options.waitTimeout) ? options.waitTimeout : Transport.WAIT_TIMEOUT;
        if (!this.isCommandAsync(command)) {
            return { headers: { IS_ASYNC_COMMAND: false, IS_NEED_REPLY: false } };
        }

        return {
            expiration,
            replyTo: this.replyQueue.get(command.name),
            correlationId: command.id,
            headers: { GATEWAY_TRANSPORT_TIMEOUT: expiration, IS_ASYNC_COMMAND: true, IS_NEED_REPLY: isNeedReply }
        };
    }

    public listen<U>(commandName: string): Observable<U> {
        if (this.listening.has(commandName)) {
            throw new ExtendedError(`Command ${commandName} is already listening`);
        }
        this.logListen(commandName);
        this.listening.add(commandName);

        const observer = new Subject<any>();
        this.listenQueue(commandName, observer);
        return observer.asObservable();
    }

    public async sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        let item = this.promises.get(command.id);
        if (item) {
            return item.handler.promise;
        }

        let handler = PromiseHandler.create<any, ExtendedError>();

        try {
            if (!this.replyQueue.has(command.name)) {
                let replyQueueName = this.generateReplyQueueName(command.name);
                this.replyQueue.set(command.name, replyQueueName);
                await this.startListenReply(replyQueueName, command);
            }

            let commandOptions = this.createCommandOptions(command, true, options);
            this.promises.set(commandOptions.correlationId, { handler, command, options });

            this.logCommand(command, TransportLogType.REQUEST_SENDED);
            await this.sendToQueue(command, commandOptions);

            if (_.isNumber(commandOptions.expiration)) {
                PromiseHandler.delay(commandOptions.expiration).then(() => {
                    handler.reject(new TransportTimeoutError(command));
                    this.promises.delete(commandOptions.correlationId);
                });
            }
        } catch (error) {
            if (!(error instanceof ExtendedError)) {
                if (error.response) {
                    error = new ExtendedError(error.response.status, error.response.statusText, error.response.data);
                } else {
                    error = ExtendedError.create(error);
                }
            }
            handler.reject(error);
        }

        return handler.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError): Promise<void> {
        const msg = this.getMessage(command);
        this.messages.delete(command.id);

        let headers = msg.properties ? msg.properties.headers : null;
        if (!this.isCommandAsync(command) || !headers.IS_NEED_REPLY) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            this.ack(msg);
            return;
        }

        let asyncCommand = command as ITransportCommandAsync<any, any>;
        if (!msg.properties || !msg.properties.correlationId || !msg.properties.replyTo) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            this.reject(msg);
            return;
        }
        let options: Options.Publish = { correlationId: msg.properties.correlationId };
        try {
            asyncCommand.response(result);
        } catch (error) {
            asyncCommand.response(error);
        }

        this.logCommand(asyncCommand, TransportLogType.RESPONSE_SENDED);

        this.sendReplyToQueue(asyncCommand, msg.properties.replyTo, options);
        this.ack(msg);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        let msg = this.getMessage(command);
        let waitCount = this.getRetry(msg);
        let headers = msg.properties.headers as ICommandHeaders;
        let timeout = _.isNil(headers.GATEWAY_TRANSPORT_TIMEOUT) ? TransportAmqp.WAIT_TIMEOUT : headers.GATEWAY_TRANSPORT_TIMEOUT;

        this.reject(msg);
        if (this.isCommandAsync(command) && waitCount * TransportAmqp.DELAY_TTL > timeout) {
            throw new TransportWaitError(`Wait timeout exceed ${command.name} (${command.id})`);
        }

        this.messages.delete(command.id);
        this.sendToDelay(command.name, msg);
    }

    public getDispatcher<T>(eventName: string): Observable<T> {
        if (!this.subscribedEvent.has(eventName)) {
            this.subscribedEvent.set(eventName, new Subject<T>());
        }

        if (!this.isEventQueueAssert) {
            this.isEventQueueAssert = true;
            this.consumeEvent();
        }

        return this.subscribedEvent.get(eventName).asObservable();
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        this.assertEventExchange();
        if (event instanceof TransportEvent) {
            event = event.toObject();
        }
        this.channel.publish(TransportAmqp.EVENT_EXCHANGE, '', Buffer.from(JSON.stringify(event)));
    }

    public getRetryCount<U, V>(command: ITransportCommand<U>): number {
        let msg = this.getMessage(command);
        return this.getRetry(msg);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected transformError(data: any): ExtendedError {
        return !_.isNil(data)
            ? new ExtendedError(data.message, data.code, data.details, data.isFatal)
            : new ExtendedError(`Unknown error`, ExtendedError.DEFAULT_ERROR_CODE);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async reconnect(): Promise<void> {
        this.debug(`Connecting to ${this.connectionUrl}...`);

        try {
            this.connection = await amqp.connect(this.connectionUrl);
            this.channel = await this.connection.createChannel();
            this.channel.prefetch(1);
            this.connectionSucceed();
        } catch (error) {
            if (this.connectionAttempts * TransportAmqp.RECONNECT_DELAY >= TransportAmqp.CONNECTION_TIMEOUT) {
                this.connectionFailed('Unable to connect: timeout expired');
                return;
            }
            this.connectionAttempts++;
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = setTimeout(() => {
                this.reconnect();
            }, TransportAmqp.RECONNECT_DELAY);
        }
    }

    private generateReplyQueueName(commandName: string) {
        return commandName + TransportAmqp.REPLY_POSTFIX + '.' + uuid();
    }

    private connectionSucceed(message?: string): void {
        if (!message) {
            message = 'Connected successfully';
        }
        this.connectionIPromise.resolve();
    }

    private connectionFailed(message?: string, error?: Error): void {
        if (!message) {
            message = 'Connection failed';
        }
        if (error) {
            message += `:\n${error.message}`;
        }

        if (!_.isNil(this.connectionIPromise)) {
            this.connectionIPromise.reject(message);
        }
        this.connectionIPromise = null;
        this.connectionPromise = null;
        this.connection = null;

        this.error(message);
        process.exit(1);
    }

    private async startListenReply<U, V>(queueName: string, command: ITransportCommandAsync<U, V>) {
        let assertedQueue = await this.assertReplyQueue(queueName);
        this.channel.consume(
            assertedQueue.queue,
            (msg: Message) => {
                this.listenReply(msg, command);
            },
            { noAck: true }
        );
    }
    private listenReply<U, V>(msg: Message, command: ITransportCommandAsync<U, V>) {
        if (_.isNil(msg.properties.correlationId)) {
            this.error(`CorrelationId not found, messageId=${msg.properties.messageId}`);
            this.error('!!!!!! No CorrelationId');
            // this.reject(msg);
            return;
        }

        let item = this.promises.get(msg.properties.correlationId);
        if (!item) {
            this.error('!!!!!! No PROMISE FOUND');
            // this.reject(msg, true);
            return;
        }

        let response = JSON.parse(msg.content.toString());
        response = this.transformNullOrUndefined(msg, response);

        let newCommand = new TransportCommandAsync<any, any>(command.name, command.request, command.id);
        newCommand.response(response);
        this.logCommand(newCommand, TransportLogType.RESPONSE_RECEIVED);

        this.rejectError(msg, response, item.handler);
        item.handler.resolve(response);

        this.promises.delete(msg.properties.correlationId);
    }

    private transformNullOrUndefined(msg: Message, data): any {
        if (msg.properties.headers && msg.properties.headers[RMQ_HEADER.GATEWAY_NULL_RESPONSE]) {
            return null;
        }
        if (msg.properties.headers && msg.properties.headers[RMQ_HEADER.GATEWAY_UNDERFINED_RESPONSE]) {
            return undefined;
        }
        return data;
    }

    private getMessage<U, V>(command: ITransportCommand<U>): Message {
        const msg = this.messages.get(command.id);
        if (!msg) {
            throw new ExtendedError(`AMQP Message for command ${command.id} not found`);
        }
        return msg;
    }

    private async listenQueue(queue: string, observer: Subject<any>): Promise<Replies.Consume> {
        await this.assert(queue);
        return this.channel.consume(
            queue,
            (msg: Message) => {
                try {
                    this.processIncomeMessage(queue, msg, observer);
                } catch (error) {
                    if (error instanceof TransportInvalidHeadersError) {
                        this.error('Got invalid message from amqp: invalid headers. Can not convert message to command');
                        this.error('Message deleted from queue ' + queue);
                        this.error({
                            message: 'Invalid AMQP message',
                            reason: 'Invalid Headers',
                            msgHeaders: msg.properties.headers,
                            msgContent: msg.content.toString(),
                            msgProperties: msg.properties
                        });
                        this.channel.reject(msg, false);
                    } else {
                        throw error;
                    }
                }
            },
            { consumerTag: uuid() }
        );
    }

    private processIncomeMessage(commandName: string, msg: Message, observer: Subject<any>) {
        let headers = msg.properties.headers as ICommandHeaders;
        let messageId = msg.properties.messageId;
        if (_.isNil(headers) || _.isNil(headers.IS_NEED_REPLY) || _.isNil(headers.IS_ASYNC_COMMAND)) {
            throw new TransportInvalidHeadersError(`Invalid headers`);
        }
        this.messages.set(messageId, msg);
        const requestJson = JSON.parse(msg.content.toString());
        const command = headers.IS_ASYNC_COMMAND
            ? new TransportCommandAsync(commandName, requestJson, messageId)
            : new TransportCommand(commandName, requestJson, messageId);

        this.logCommand(command, TransportLogType.REQUEST_RECEIVED);
        observer.next(command);
    }

    private ack(msg: Message): void {
        this.channel.ack(msg);
    }

    private reject(msg: Message, requeue: boolean = false): void {
        this.channel.reject(msg, requeue);
    }

    private async sendToDelay(queue, msg: Message): Promise<boolean> {
        const delayQueue = queue + '_delay';
        await this.assertDelay(queue, delayQueue);
        return this.channel.publish(delayQueue, '', msg.content, msg.properties);
    }

    private rejectError(msg: Message, data: any, promise: PromiseHandler<any, ExtendedError>) {
        if (msg.properties.headers && msg.properties.headers[RMQ_HEADER.GATEWAY_TRANSPORT_ERROR]) {
            promise.reject(this.transformError(data));
        }
    }

    private async sendToQueue<U>(command: ITransportCommand<U>, options?: Options.Publish): Promise<boolean> {
        if (_.isNil(options)) {
            options = {};
        }

        options.messageId = command.id;
        const request = command.request;
        await this.assert(command.name);
        return this.channel.sendToQueue(command.name, Buffer.from(JSON.stringify(request)), options);
    }

    private async sendReplyToQueue<U, V>(command: ITransportCommandAsync<U, V>, replyQueueName: string, options = {} as Options.Publish): Promise<boolean> {
        options.messageId = command.id;
        options.headers = {};

        let data = command.error ? command.error : command.data;
        if (command.error) {
            options.headers[RMQ_HEADER.GATEWAY_TRANSPORT_ERROR] = true;
        } else if (data === undefined) {
            options.headers[RMQ_HEADER.GATEWAY_UNDERFINED_RESPONSE] = true;
            data = {} as any;
        } else if (data === null) {
            options.headers[RMQ_HEADER.GATEWAY_NULL_RESPONSE] = true;
            data = {} as any;
        }
        return this.channel.sendToQueue(replyQueueName, Buffer.from(JSON.stringify(data)), options);
    }

    private async assert(queue: string): Promise<boolean> {
        if (this.asserts.has(queue)) {
            return Promise.resolve(true);
        }

        try {
            let options: Options.AssertQueue = { durable: true };
            if (queue.search(TransportAmqp.REPLY_POSTFIX) > 0) {
                options.messageTtl = TransportAmqp.WAIT_TIMEOUT;
            }
            await this.channel.assertExchange(queue, 'direct');
            await this.channel.assertQueue(queue, options);
            await this.channel.bindQueue(queue, queue, queue);
            this.asserts.add(queue);
            return Promise.resolve(true);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private async assertReplyQueue(queueName: string): Promise<Replies.AssertQueue> {
        try {
            let options: Options.AssertQueue = { exclusive: true };
            return await this.channel.assertQueue(queueName, options);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private async assertEventQueue(): Promise<string> {
        if (this.eventQueueName !== undefined) {
            return this.eventQueueName;
        }

        try {
            await this.assertEventExchange();
            let eventQueue = await this.channel.assertQueue('', { exclusive: true });
            this.eventQueueName = eventQueue.queue;
            await this.channel.bindQueue(eventQueue.queue, TransportAmqp.EVENT_EXCHANGE, '');
            return this.eventQueueName;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private async assertEventExchange() {
        if (this.asserts.has(TransportAmqp.EVENT_EXCHANGE)) {
            return Promise.resolve(true);
        }
        try {
            await this.channel.assertExchange(TransportAmqp.EVENT_EXCHANGE, 'fanout', { durable: false });
            this.asserts.add(TransportAmqp.EVENT_EXCHANGE);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private async consumeEvent(): Promise<void> {
        await this.assertEventQueue();
        console.log(this.eventQueueName);
        this.channel
            .consume(
                this.eventQueueName,
                (msg: Message) => {
                    const event = JSON.parse(msg.content.toString()) as ITransportEvent<any>;
                    let observer = this.subscribedEvent.get(event.name);
                    if (observer) {
                        observer.next(event);
                    }
                },
                { noAck: true }
            )
            .then(consume => {
                this.consumes.set(TransportAmqp.EVENT_CONSUMER, consume.consumerTag);
            });
    }

    private async assertDelay(queue: string, delayQueue: string): Promise<boolean> {
        if (this.delayAsserts.has(queue)) {
            return Promise.resolve(true);
        }
        try {
            await this.channel.assertExchange(delayQueue, 'direct');
            await this.channel.assertQueue(delayQueue, {
                durable: true,
                deadLetterRoutingKey: queue,
                deadLetterExchange: queue,
                messageTtl: TransportAmqp.DELAY_TTL
            });
            await this.channel.bindQueue(delayQueue, delayQueue, '');
            this.delayAsserts.add(delayQueue);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private unsubscribeListeners() {
        if (this._connection) {
            this._connection.off('close', this.connectionClosedHandler);
            this._connection.off('error', this.connectionErrorHandler);
        }
    }

    private getRetry(msg: Message): number {
        return !msg.properties.headers || !msg.properties.headers['x-death'] ? 0 : parseInt(msg.properties.headers['x-death'][0].count.toString(), 10);
    }

    /*
    private debugSendCommand<U>(command: ITransportCommand<U>) {
        const anyRequest = (command.request as any) as ITraceable;
        const logMessage = {
            message: `Send Listen ${command.name}`,
            commandId: command.id,
            traceId: anyRequest.traceId || null
        };
        this.debug(logMessage);
    }

    private debugListenCommand<U>(command: ITransportCommand<U>) {
        const commandAnyResponse = (command.request as any) as ITraceable;
        const logMessage = {
            message: `Get response ${command.name}`,
            commandId: command.id,
            traceId: commandAnyResponse.traceId || null
        };
        this.debug(logMessage);
    }

    private debugReply(messageId: string, jsonResponse: any) {
        const logMessage = {
            message: `Get reply response ${messageId}`,
            commandId: messageId,
            traceId: jsonResponse.traceId || null
        };
        this.debug(logMessage);
    }
    */
    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    private connectionErrorHandler = (error?: Error) => {
        this.connectionFailed('Connection error', error);
    };
    private connectionClosedHandler = (error?: Error) => {
        this.connectionFailed('Connection closed', error);
    };

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private get connection(): amqp.Connection {
        return this._connection;
    }
    private set connection(value: amqp.Connection) {
        // this.unsubscribeListeners();
        this._connection = value;
        if (this._connection) {
            this._connection.on('close', this.connectionClosedHandler);
            this._connection.on('error', this.connectionErrorHandler);
        }
    }

    private get connectionUrl(): string {
        let value =
            this.settings.amqpProtocol +
            '://' +
            this.settings.amqpUserName +
            ':' +
            this.settings.amqpPassword +
            '@' +
            this.settings.amqpHost +
            ':' +
            this.settings.amqpPort;
        if (this.settings.amqpVhost !== '' && this.settings.amqpVhost !== '/') {
            value += '/' + this.settings.amqpVhost;
        }
        return value;
    }
}

interface ICommandOptions {
    headers: ICommandHeaders;
    replyTo?: string;
    expiration?: number;
    correlationId?: string;
}

interface ICommandHeaders {
    IS_NEED_REPLY: boolean;
    IS_ASYNC_COMMAND: boolean;
    GATEWAY_TRANSPORT_TIMEOUT?: number;
}

enum RMQ_HEADER {
    GATEWAY_UNDERFINED_RESPONSE = 'GATEWAY_UNDERFINED_RESPONSE',
    GATEWAY_NULL_RESPONSE = 'GATEWAY_NULL_RESPONSE',
    GATEWAY_TRANSPORT_ERROR = 'GATEWAY_TRANSPORT_ERROR'
}
