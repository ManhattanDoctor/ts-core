import * as amqp from 'amqplib';
import { Channel, Message, Options, Replies } from 'amqplib';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import * as uuid from 'uuid';
import { ExtendedError } from '../../common/error';
import { ILogger } from '../../common/logger';
import { PromiseHandler } from '../../common/promise';
import { ITraceable, TraceUtil } from '../../common/trace';
import {
    ITransportCommand,
    ITransportCommandAsync,
    ITransportCommandOptions,
    ITransportEvent,
    Transport,
    TransportCommand,
    TransportCommandAsync,
    TransportEvent,
    TransportWaitError
} from '../../common/transport';
import { IAmqpSettings } from '../settings/IAmqpSettings';

export class TransportAmqp extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static WAIT_TIMEOUT = 30000;
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
    private delayAsserts: Set<string>;
    private messages: Map<string, Message>;
    private listening: Set<string>;
    private consumes: Map<string, string>;
    private replyQueue: Map<string, string>;
    private replyPromises: Map<string, PromiseHandler<any, ExtendedError>>;

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
        this.replyPromises = new Map();
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

    public async disconnect() {
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
                            this.error('channel closed Error: ' + error.message);
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
        this.debugSendCommand(command);
        this.sendToQueue(command);
    }

    public listen<U>(commandName: string): Observable<U> {
        if (this.listening.has(commandName)) {
            throw new ExtendedError(`Command ${commandName} is already listening`);
        }
        this.log(`Started to listen ${commandName} command`);
        this.listening.add(commandName);

        const observer = new Subject<any>();

        this.listenQueue(
            commandName,
            (msg: Message) => {
                this.messages.set(msg.properties.messageId, msg);
                const requestJson = JSON.parse(msg.content.toString()) as U;
                const command =
                    msg.properties.headers && msg.properties.headers.IS_ASYNC_COMMAND
                        ? new TransportCommandAsync(commandName, requestJson, msg.properties.messageId)
                        : new TransportCommand(commandName, requestJson, msg.properties.messageId);
                this.debugListenCommand(command);
                observer.next(command);
            },
            { consumerTag: uuid() }
        ).then();

        return observer.asObservable();
    }

    public async sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        const waitTimeout = !options || !options.waitTimeout ? TransportAmqp.WAIT_TIMEOUT : options.waitTimeout;

        this.debugSendCommand(command);
        let promise = PromiseHandler.create<any, ExtendedError>();

        let correlationId = command.id;
        this.replyPromises.set(correlationId, promise);

        let error = new ExtendedError(`Command ${command.name} is timed out`, null, command);
        setTimeout(() => promise.reject(error), waitTimeout);

        try {
            if (!this.replyQueue.has(command.name)) {
                let replyQueueName = this.generateReplyQueueName(command.name);
                this.replyQueue.set(command.name, replyQueueName);
                await this.startListenReply(replyQueueName);
            }
            await this.sendToQueue(command, {
                replyTo: this.replyQueue.get(command.name),
                correlationId,
                headers: { GATEWAY_TRANSPORT_TIMEOUT: waitTimeout, IS_ASYNC_COMMAND: true }
            });
        } catch (error) {
            this.parseError(error, promise.reject);
        }

        return promise.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError): Promise<void> {
        const msg = this.getMessage(command);
        this.messages.delete(command.id);
        if (!this.isCommandAsync(command)) {
            this.ack(msg);
            return;
        }

        let asyncCommand = command as ITransportCommandAsync<any, any>;
        if (!msg.properties || !msg.properties.correlationId || !msg.properties.replyTo) {
            this.reject(msg);
            return;
        }
        let options: Options.Publish = { correlationId: msg.properties.correlationId };
        try {
            asyncCommand.response(result);
        } catch (error) {
            asyncCommand.response(error);
        }
        this.sendReplyToQueue(asyncCommand, msg.properties.replyTo, options);
        this.ack(msg);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        const msg = this.getMessage(command);
        const waitCount = this.getRetry(msg);

        const timeout =
            !msg.properties.headers || !msg.properties.headers.GATEWAY_TRANSPORT_TIMEOUT
                ? TransportAmqp.WAIT_TIMEOUT
                : msg.properties.headers.GATEWAY_TRANSPORT_TIMEOUT;

        this.reject(msg);
        if ((this.isCommandAsync(command), waitCount * TransportAmqp.DELAY_TTL > timeout)) {
            throw new TransportWaitError('Error  CommandWait "' + command.id + '"');
        }

        this.messages.delete(command.id);
        this.sendToDelay(command.name, msg);
    }

    public getDispatcher<T>(eventName: string): Observable<T> {
        this.log(`Subscribed on ${eventName}`);
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
        this.log(`Dispatched ${event.name}`);
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
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async reconnect(): Promise<void> {
        this.log(`Connecting to ${this.connectionUrl}...`);

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
        this.log(message);
        this.connectionIPromise.resolve();
    }

    private connectionFailed(message?: string): void {
        if (!message) {
            message = 'Connection failed';
        }
        this.connectionIPromise.reject(message);
        this.connectionIPromise = null;
        this.connectionPromise = null;
        this.connection = null;

        this.error(message);
        process.exit(1);
    }

    private async startListenReply(queueName: string) {
        let assertedQueue = await this.assertReplyQueue(queueName);
        this.channel.consume(
            assertedQueue.queue,
            (msg: Message) => {
                this.listenReply(msg);
            },
            { noAck: true }
        );
    }
    private listenReply(msg: Message) {
        if (msg.properties.correlationId == null) {
            this.error('CorrelationId not found, messageId=' + msg.properties.messageId);
            this.reject(msg);
            return;
        }

        const promise = this.replyPromises.get(msg.properties.correlationId);
        if (!promise) {
            this.reject(msg, true);
            return;
        }

        this.replyPromises.delete(msg.properties.correlationId);
        let responseJson = JSON.parse(msg.content.toString());
        responseJson = this.transformNullOrUndefined(msg, responseJson);
        this.rejectError(msg, responseJson as ExtendedError, promise.reject);
        this.debugReply(msg.properties.messageId, responseJson);
        promise.resolve(responseJson);
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
            throw new ExtendedError(`Rmq Message for command ${command.id} not found`);
        }
        return msg;
    }

    private async listenQueue(queue: string, callback: (msg: Message) => void, options?: Options.Consume): Promise<Replies.Consume> {
        await this.assert(queue);
        return this.channel.consume(
            queue,
            (msg: Message) => {
                callback(msg);
            },
            options
        );
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

    private rejectError(msg: Message, data: ExtendedError, reject: (error: ExtendedError) => void) {
        if (msg.properties.headers && msg.properties.headers[RMQ_HEADER.GATEWAY_TRANSPORT_ERROR]) {
            reject(data);
        }
    }

    private async sendToQueue<U>(command: ITransportCommand<U>, options = {} as Options.Publish): Promise<boolean> {
        options.messageId = command.id;
        const request = command.request;

        if (!TraceUtil.isHas(request as ITraceable)) {
            this.error(`Command ${command.name} doesn't have traceId`);
        } else {
            // this.warn(`${(request as ITraceable).traceId} | ${command.name}`);
        }

        await this.assert(command.name);
        return this.channel.sendToQueue(command.name, Buffer.from(JSON.stringify(request)), options);
    }

    private async sendReplyToQueue<U, V>(command: ITransportCommandAsync<U, V>, replyQueueName, options = {} as Options.Publish): Promise<boolean> {
        options.messageId = command.id;
        const data = command.error ? command.error : command.data;

        options.headers = {};

        if (command.error) {
            options.headers[RMQ_HEADER.GATEWAY_TRANSPORT_ERROR] = true;
        } else if (data === undefined) {
            options.headers[RMQ_HEADER.GATEWAY_UNDERFINED_RESPONSE] = true;
        } else if (data === null) {
            options.headers[RMQ_HEADER.GATEWAY_NULL_RESPONSE] = true;
        }

        return this.channel.sendToQueue(replyQueueName, Buffer.from(JSON.stringify(data)), options);
    }

    private async assert(queue: string): Promise<boolean> {
        if (this.asserts.has(queue)) return Promise.resolve(true);

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
        if (this.asserts.has(TransportAmqp.EVENT_EXCHANGE)) return Promise.resolve(true);
        try {
            await this.channel.assertExchange(TransportAmqp.EVENT_EXCHANGE, 'fanout', { durable: false });
            this.asserts.add(TransportAmqp.EVENT_EXCHANGE);
            return Promise.resolve(true);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private async consumeEvent(): Promise<void> {
        await this.assertEventQueue();
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
        if (this.delayAsserts.has(queue)) return Promise.resolve(true);
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
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private parseError(error: any, reject: (error: Error) => void): void {
        let response: ExtendedError = null;
        if (error instanceof ExtendedError) {
            response = error;
        } else if (error.response) {
            error = error.response;
            response = new ExtendedError(error.status, error.statusText, error.data);
        } else {
            response = ExtendedError.create(error);
        }

        reject(response);
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
    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    private connectionErrorHandler = (error?: Error) => {
        this.connectionFailed('Connection error');
    };
    private connectionClosedHandler = (error?: Error) => {
        this.connectionFailed('Connection closed');
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

enum RMQ_HEADER {
    GATEWAY_UNDERFINED_RESPONSE = 'GATEWAY_UNDERFINED_RESPONSE',
    GATEWAY_NULL_RESPONSE = 'GATEWAY_NULL_RESPONSE',
    GATEWAY_TRANSPORT_ERROR = 'GATEWAY_TRANSPORT_ERROR'
}
