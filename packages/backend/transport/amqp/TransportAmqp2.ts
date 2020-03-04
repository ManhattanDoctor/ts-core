import { ExtendedError } from '@ts-core/common/error';
import { LoadableEvent } from '@ts-core/common/Loadable';
import { ILogger } from '@ts-core/common/logger';
import { ObservableData } from '@ts-core/common/observer';
import { PromiseHandler } from '@ts-core/common/promise';
import {
    ITransportCommand,
    ITransportCommandAsync,
    ITransportCommandOptions,
    ITransportEvent,
    Transport,
    TransportCommandWaitDelay,
    TransportLogType,
    TransportTimeoutError
} from '@ts-core/common/transport';
import { TransportWaitExceedError } from '@ts-core/common/transport/error';
import { DateUtil, ObjectUtil, TransformUtil } from '@ts-core/common/util';
import * as amqp from 'amqplib';
import { Channel, Connection, Message } from 'amqplib';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';
import { ITransportAmqpEventOptions } from './ITransportAmqpEventOptions';
import { ITransportAmqpRequestOptions } from './ITransportAmqpRequestOptions';
import { ITransportAmqpResponseOptions } from './ITransportAmqpResponseOptions';
import { ITransportAmqpSettings } from './ITransportAmqpSettings';
import { TransportAmqpEventPayload } from './TransportAmqpEventPayload';
import { TransportAmqpRequestPayload } from './TransportAmqpRequestPayload';
import { TransportAmqpResponsePayload } from './TransportAmqpResponsePayload';

export class TransportAmqp2 extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Constant
    //
    // --------------------------------------------------------------------------

    private static POSTFIX_WAIT = '.WAIT';
    private static POSTFIX_REPLY = '.REPLY';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private queues: Map<string, PromiseHandler<string, ExtendedError<void>>>;
    private requests: Map<string, IRequestStorage>;

    private uid: string;
    private settings: ITransportAmqpSettings;

    private connectionPromise: PromiseHandler<void, ExtendedError>;
    private connectionAttempts: number;

    private _channel: Channel;
    private _connection: Connection;
    private _isConnected: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);
        this.uid = uuid();
        this.queues = new Map();
        this.requests = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Amqp Methods
    //
    // --------------------------------------------------------------------------

    public async connect(settings: ITransportAmqpSettings): Promise<void> {
        if (_.isNil(settings)) {
            throw new ExtendedError(`Unable to connect: settings is nil`);
        }
        if (!_.isNumber(settings.reconnectDelay)) {
            settings.reconnectDelay = DateUtil.MILISECONDS_SECOND;
        }
        if (!_.isNumber(settings.reconnectMaxAttempts)) {
            settings.reconnectMaxAttempts = 10;
        }
        if (!_.isBoolean(settings.isExitApplicationOnDisconnect)) {
            settings.isExitApplicationOnDisconnect = true;
        }
        if (_.isNil(settings.queuePrefix)) {
            settings.queuePrefix = `AMQP2.`;
        }

        if (this.connectionPromise) {
            return this.connectionPromise.promise;
        }

        this.settings = settings;
        this.connectionPromise = PromiseHandler.create();
        this.connectionAttempts = 0;
        this.reconnect();

        return this.connectionPromise.promise;
    }

    public disconnect(error?: ExtendedError): void {
        this.queues.forEach(item => item.reject(error));
        this.queues.clear();

        this.requests.forEach(item => this.channel.nack(item.message, false, true));
        this.requests.clear();

        if (this.connectionPromise) {
            this.connectionPromise.reject(error);
            this.connectionPromise = null;
        }

        this.channel = null;
        this.connection = null;
        this._isConnected = false;

        if (this.settings.isExitApplicationOnDisconnect) {
            this.log(`Exit application: disconnected`);
            process.exit(1);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void {
        this.requestSend(command, this.getCommandOptions(command, options), false);
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        if (this.promises.has(command.id)) {
            return this.promises.get(command.id).handler.promise;
        }

        options = this.getCommandOptions(command, options);

        let handler = PromiseHandler.create<V, ExtendedError>();
        this.promises.set(command.id, { command, handler, options });
        this.requestSend(command, options, true);
        return handler.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to complete "${command.name}" command: transport is not connected`);
        }

        let request = this.requests.get(command.id);
        this.requests.delete(command.id);

        if (!this.isCommandAsync(command)) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            this.channel.ack(request.message);
            return;
        }

        if (this.isPayloadExpired(request.payload)) {
            this.logCommand(command, TransportLogType.RESPONSE_TIMEOUT);
            this.warn(`Unable to complete "${command.name}" command: timeout is expired`);
            // this.channel.nack(request.message);
            // return;
        }

        let async = command as ITransportCommandAsync<U, any>;
        async.response(result);
        this.responseSend(async, request.message);
    }

    public listen<U>(name: string): Observable<U> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to listen "${name}" command: transport is not connected`);
        }

        let item = super.listen<U>(name);
        this.createQueueIfNeed(this.listenQueueForRequest, this.createQueueName(name));
        return item;
    }

    public wait<U>(command: ITransportCommand<U>): void {
        let request = this.requests.get(command.id);
        if (_.isNil(request)) {
            throw new ExtendedError(`Unable to wait "${command.name}" command: can't find request details`);
        }

        if (this.isWaitExpired(request)) {
            this.complete(command, new TransportWaitExceedError(command));
            return;
        }

        this.channel.nack(request.message, false, false);
        this.waitSend(command, request.payload.waitDelay, request.message);
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        this.eventSend(event);
    }

    public destroy(): void {
        super.destroy();
        this.disconnect();

        this.queues = null;
        this.requests = null;

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Override Protected
    //
    // --------------------------------------------------------------------------

    protected getCommandTimeoutDelay<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): number {
        return 2 * super.getCommandTimeoutDelay(command as any, options);
    }

    protected isWaitExpired(request: IRequestStorage): boolean {
        if (!_.isNil(request.payload.waitMaxCount) && request.waitCount > request.payload.waitMaxCount) {
            return true;
        }
        if (request.waitCount * request.payload.waitDelay >= request.payload.waitTimeout) {
            return true;
        }
        return false;
    }

    protected isPayloadExpired(payload: TransportAmqpRequestPayload): boolean {
        return Date.now() > payload.expiredDate.getTime();
    }

    // --------------------------------------------------------------------------
    //
    //  Send Methods
    //
    // --------------------------------------------------------------------------

    protected async requestSend<U>(command: ITransportCommand<U>, options: ITransportCommandOptions, isNeedReply: boolean): Promise<void> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to send "${command.name}" command request: transport is not connected`);
        }

        this.logCommand(command, this.isCommandAsync(command) ? TransportLogType.REQUEST_SENDED : TransportLogType.REQUEST_NO_REPLY);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, command));

        let request = this.createRequestOptions(command, options, isNeedReply);
        if (isNeedReply) {
            request.replyTo = await this.createQueueIfNeed(this.listenQueueForReply, this.createQueueReplyName(request.queue));
        }

        await this.createQueueIfNeed(this.createQueueForCommand, request.queue);
        let content = Buffer.from(TransformUtil.fromJSON(request.payload));

        try {
            await this.channel.sendToQueue(request.queue, content, request);
            if (this.isCommandAsync(command)) {
                this.commandTimeout(command as ITransportCommandAsync<U, any>, options);
            }
        } catch (error) {
            this.error(new ExtendedError(`Unable to send "${command.name}" command request: ${error.message}`));
        }
    }

    protected async responseSend<U, V>(command: ITransportCommandAsync<U, V>, message: Message): Promise<void> {
        this.logCommand(command, TransportLogType.RESPONSE_SENDED);

        let response = this.createResponseOptions(command, message);
        let content = Buffer.from(TransformUtil.fromJSON(response.payload));
        try {
            await this.channel.sendToQueue(response.queue, content, response);
            this.channel.ack(message);
        } catch (error) {
            this.error(new ExtendedError(`Unable to send "${command.name}" command response: ${error.message}`));
        }
    }

    protected async eventSend<U>(event: ITransportEvent<U>): Promise<void> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to send "${event.name}" event: transport is not connected`);
        }

        this.logEvent(event, TransportLogType.EVENT_SENDED);
        let request = this.createEventOptions(event);
        let content = Buffer.from(TransformUtil.fromJSON(request.payload));

        try {
            await this.channel.publish(request.queue, '', content);
        } catch (error) {
            throw new ExtendedError(`Unable to send "${event.name}" event: ${error.message}`);
        }
    }

    protected async waitSend<U>(command: ITransportCommand<U>, waitDelay: TransportCommandWaitDelay, message: Message): Promise<void> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to send wait "${command.name}" command: transport is not connected`);
        }

        this.logCommand(command, TransportLogType.RESPONSE_WAIT);

        let queue = this.createQueueName(command.name);
        let waitQueue = await this.createQueueIfNeed(this.createQueueForWait, this.createWaitQueueName(queue, waitDelay), waitDelay, queue);
        try {
            await this.channel.publish(waitQueue, '', message.content, message.properties);
        } catch (error) {
            this.complete(command, new ExtendedError(`Unable to send wait "${command.name}" command: ${error.message}`));
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Recevie Methods
    //
    // --------------------------------------------------------------------------

    protected requestReceived<U>(command: ITransportCommand<U>, message: Message): void {
        this.logCommand(command, TransportLogType.REQUEST_RECEIVED);

        let listener = this.listeners.get(command.name);
        if (_.isNil(listener)) {
            this.complete(command, new ExtendedError(`No listener for "${command.name}" command`));
            return;
        }
        listener.next(command);
    }

    protected responseReceived<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);
        this.commandProcessed(command);
    }

    protected eventReceived<U>(event: ITransportEvent<U>): void {
        let item = this.dispatchers.get(event.name);
        if (_.isNil(item)) {
            return;
        }
        item.next(event);
    }

    // --------------------------------------------------------------------------
    //
    //  Recevie Message Methods
    //
    // --------------------------------------------------------------------------

    protected requestMessageReceived = <U>(message: Message): void => {
        if (_.isNil(message)) {
            this.warn(`Received nil request message: probably queue was destroyed`);
            return;
        }

        let command: ITransportCommand<U> = null;
        let payload: TransportAmqpRequestPayload<U> = null;
        try {
            payload = TransportAmqpRequestPayload.parse(message);
            command = TransportAmqpRequestPayload.createCommand(payload);
        } catch (error) {
            this.error(error);
            this.channel.nack(message, false, false);
            return;
        }

        if (this.isPayloadExpired(payload)) {
            this.logCommand(command, TransportLogType.REQUEST_EXPIRED);
            this.warn(`Unable to receive "${command.name}" command: timeout expired`);
            // this.channel.nack(message, false, false);
            // return;
        }

        if (this.requests.has(command.id)) {
            let request = this.requests.get(command.id);
            request.message = message;
            request.waitCount++;
        } else {
            this.requests.set(command.id, { message, payload, waitCount: 0 });
        }
        this.requestReceived(command, message);
    };

    protected responseMessageReceived = (message: Message): void => {
        if (_.isNil(message)) {
            this.warn(`Received nil response message: probably queue was destroyed`);
            return;
        }

        let payload: TransportAmqpResponsePayload = null;
        try {
            payload = TransportAmqpResponsePayload.parse(message);
        } catch (error) {
            this.error(error);
            this.channel.nack(message, false, false);
            return;
        }

        let promise = this.promises.get(payload.id);
        if (_.isNil(promise)) {
            this.error(`Invalid response: unable to find command "${payload.id}", probably timeout already expired`);
            return;
        }
        let command = promise.command;
        command.response(payload.response);
        this.responseReceived(command);
    };

    protected eventMessageReceived = <U>(message: Message): void => {
        if (_.isNil(message)) {
            this.warn(`Received nil event message: probably queue was destroyed`);
            return;
        }

        let event: ITransportEvent<U> = null;
        try {
            event = TransportAmqpEventPayload.parse(message);
        } catch (error) {
            this.error(error);
            return;
        }
        this.eventReceived(event);
    };

    // --------------------------------------------------------------------------
    //
    //  Queue Methods
    //
    // --------------------------------------------------------------------------

    protected async createQueueIfNeed(queueBuilder: (name: string, ...params) => Promise<string>, name: string, ...params): Promise<string> {
        if (!_.isNil(name) && this.queues.has(name)) {
            return this.queues.get(name).promise;
        }

        if (_.isEmpty(params)) {
            params = [];
        }
        params.unshift(name);
        let promise = PromiseHandler.create<string, ExtendedError<void>>();
        try {
            name = await queueBuilder.apply(this, params);
            promise.resolve(name);
        } catch (error) {
            promise.reject(ExtendedError.create(error));
        }
        this.queues.set(name, promise);
        return promise.promise;
    }

    protected listenQueueForRequest = async (name: string): Promise<string> => {
        await this.createQueueForCommand(name);
        await this.channel.consume(name, this.requestMessageReceived);
        return name;
    };

    protected listenQueueForReply = async (name: string): Promise<string> => {
        let { queue } = await this.channel.assertQueue(name, { exclusive: true });
        await this.channel.consume(queue, this.responseMessageReceived, { noAck: true });
        return queue;
    };

    protected listenQueueEvents = async (name: string): Promise<string> => {
        let { exchange } = await this.channel.assertExchange(name, 'fanout', { durable: false });
        let { queue } = await this.channel.assertQueue('', { exclusive: true });
        await this.channel.bindQueue(queue, exchange, '');
        await this.channel.consume(queue, this.eventMessageReceived, { noAck: true });
        return name;
    };

    protected createQueueForCommand = async (name: string): Promise<string> => {
        await this.channel.assertExchange(name, 'direct');
        await this.channel.assertQueue(name, { durable: true });
        await this.channel.bindQueue(name, name, name);
        return name;
    };

    private createQueueForWait = async (waitQueue: string, waitDelay: TransportCommandWaitDelay, queue: string): Promise<string> => {
        await this.channel.assertExchange(waitQueue, 'direct');
        await this.channel.assertQueue(waitQueue, {
            durable: true,
            deadLetterRoutingKey: queue,
            deadLetterExchange: queue,
            messageTtl: waitDelay
        });
        await this.channel.bindQueue(waitQueue, waitQueue, '');
        return waitQueue;
    };

    protected createEventOptions<U>(event: ITransportEvent<U>): ITransportAmqpEventOptions<U> {
        let payload = new TransportAmqpEventPayload<U>(event);
        let request = { payload, queue: this.getEventQueueName() } as ITransportAmqpEventOptions;
        return request;
    }

    protected createRequestOptions<U>(command: ITransportCommand<U>, options: ITransportCommandOptions, isNeedReply: boolean): ITransportAmqpRequestOptions<U> {
        let payload = new TransportAmqpRequestPayload<U>();
        ObjectUtil.copyProperties(command, payload, ['id', 'name', 'request']);
        ObjectUtil.copyProperties(options, payload);

        payload.isNeedReply = isNeedReply;
        if (this.isCommandAsync(command)) {
            payload.expiredDate = DateUtil.getDate(Date.now() + this.getCommandTimeoutDelay(command, options));
        }

        let request = { payload, expiration: payload.waitTimeout, queue: this.createQueueName(command.name) } as ITransportAmqpRequestOptions;
        if (payload.isNeedReply) {
            request.messageId = request.correlationId = command.id;
        }
        return request;
    }

    protected createResponseOptions<U, V>(command: ITransportCommandAsync<U, V>, message: Message): ITransportAmqpResponseOptions<U> {
        let payload = new TransportAmqpResponsePayload<U, V>(command);
        let response = { payload: TransformUtil.fromClass(payload) } as any;
        response.queue = response.replyTo = message.properties.replyTo;
        return response;
    }

    protected createQueueName(name: string): string {
        return this.prefixAdd(name);
    }

    protected createQueueReplyName(name: string): string {
        return `${name}${TransportAmqp2.POSTFIX_REPLY}.${this.uid}`;
    }

    protected createWaitQueueName(name: string, waitDelay: TransportCommandWaitDelay): string {
        return `${name}${TransportAmqp2.POSTFIX_WAIT}.${waitDelay}`;
    }

    protected createConnectionUrl(settings: ITransportAmqpSettings): string {
        let value = settings.amqpProtocol + '://' + settings.amqpUserName + ':' + settings.amqpPassword + '@' + settings.amqpHost + ':' + settings.amqpPort;
        if (settings.amqpVhost !== '' && settings.amqpVhost !== '/') {
            value += '/' + settings.amqpVhost;
        }
        return value;
    }

    protected getEventQueueName(): string {
        return this.prefixAdd(`${!_.isNil(this.settings.queueEvent) ? this.settings.queueEvent : 'EVENT_EXCHANGER'}`);
    }

    protected prefixAdd(value: string): string {
        return `${this.settings.queuePrefix}${value}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected connectionConnectCompleteHandler = (): void => {
        this._isConnected = true;
        if (this.connectionPromise) {
            this.connectionPromise.resolve();
        }
    };

    protected connectionConnectErrorHandler = (error: ExtendedError): void => {
        console.log('connectionConnectErrorHandler', error);
        this.disconnect(error);
    };

    protected connectionErrorHandler = (error: any): void => {
        console.log('connectionErrorHandler', error);
        // this.disconnect(ExtendedError.create(error));
    };

    protected connectionClosedHandler = (error: any): void => {
        console.log('connectionClosedHandler', error);
        this.disconnect(ExtendedError.create(error));
    };

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected get channel(): Channel {
        return this._channel;
    }
    protected set channel(value: Channel) {
        if (this._channel) {
            this._channel.close();
        }
        this._channel = value;
        if (this._channel) {
            this.channel.prefetch(1);
        }
    }

    protected get connection(): amqp.Connection {
        return this._connection;
    }
    protected set connection(value: amqp.Connection) {
        if (this._connection) {
            this._connection.off('error', this.connectionErrorHandler);
            this._connection.off('close', this.connectionClosedHandler);
            this._connection.close();
        }
        this._connection = value;
        if (this._connection) {
            this._connection.on('error', this.connectionErrorHandler);
            this._connection.on('close', this.connectionClosedHandler);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Amqp Methods
    //
    // --------------------------------------------------------------------------

    protected async reconnect(): Promise<void> {
        let url = this.createConnectionUrl(this.settings);
        this.debug(`Connecting to ${url}...`);

        this.connectionAttempts++;
        try {
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            await this.createQueueIfNeed(this.listenQueueEvents, this.getEventQueueName());
            this.connectionConnectCompleteHandler();
        } catch (error) {
            if (this.connectionAttempts > this.settings.reconnectMaxAttempts) {
                this.connectionConnectErrorHandler(ExtendedError.create(error, TransportTimeoutError.ERROR_CODE));
                return;
            }
            await PromiseHandler.delay(this.settings.reconnectDelay);
            this.debug(`Trying to reconnect (attempt ${this.connectionAttempts})`);
            this.reconnect();
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public get isConnected(): boolean {
        return this._isConnected;
    }
}

interface IRequestStorage {
    message: Message;
    payload: TransportAmqpRequestPayload;
    waitCount: number;
}
