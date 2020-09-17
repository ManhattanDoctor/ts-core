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
    ITransportRequestStorage,
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
import { TransportAmqpEventPayload } from './TransportAmqpEventPayload';
import { TransportAmqpRequestPayload } from './TransportAmqpRequestPayload';
import { TransportAmqpResponsePayload } from './TransportAmqpResponsePayload';
import { ITransportSettings } from '@ts-core/common/transport';
import { IAmqpSettings } from '../../settings';

export class TransportAmqp2 extends Transport<ITransportAmqpSettings> {
    // --------------------------------------------------------------------------
    //
    //  Constant
    //
    // --------------------------------------------------------------------------

    private static QUEUE_WAIT = 'QUEUE_WAIT';
    private static QUEUE_REPLY = 'QUEUE_REPLY';

    private static EXCHANGE_DEAD = 'EXCHANGE_DEAD';
    private static EXCHANGE_WAIT = 'EXCHANGE_WAIT';
    private static EXCHANGE_EVENT = 'EXCHANGE_EVENT';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private uid: string;
    private queueOrExchanger: Map<string, PromiseHandler<string, ExtendedError<void>>>;

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

    constructor(logger: ILogger, settings: ITransportAmqpSettings, context?: string) {
        super(logger, settings, context);
        this.uid = uuid();
        this.queueOrExchanger = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Amqp Methods
    //
    // --------------------------------------------------------------------------

    public async connect(): Promise<void> {
        if (_.isNil(this.settings)) {
            throw new ExtendedError(`Unable to connect: settings is nil`);
        }
        if (!_.isNumber(this.settings.reconnectDelay)) {
            this.settings.reconnectDelay = DateUtil.MILISECONDS_SECOND;
        }
        if (!_.isNumber(this.settings.reconnectMaxAttempts)) {
            this.settings.reconnectMaxAttempts = 10;
        }
        if (!_.isBoolean(this.settings.isExitApplicationOnDisconnect)) {
            this.settings.isExitApplicationOnDisconnect = true;
        }
        if (_.isNil(this.settings.amqpQueuePrefix)) {
            this.settings.amqpQueuePrefix = `AMQP2`;
        }

        if (this.connectionPromise) {
            return this.connectionPromise.promise;
        }

        this.connectionPromise = PromiseHandler.create();
        this.connectionAttempts = 0;
        this.reconnect();

        return this.connectionPromise.promise;
    }

    public disconnect(error?: ExtendedError): void {
        this.queueOrExchanger.forEach(item => item.reject(error));
        this.queueOrExchanger.clear();

        this.requests.forEach((item: ITransportAmqpRequestStorage) => this.channel.nack(item.message, false, true));
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
            process.exit(0);
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

    public async sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        if (this.promises.has(command.id)) {
            return this.promises.get(command.id).handler.promise;
        }

        options = this.getCommandOptions(command, options);

        let handler = PromiseHandler.create<V, ExtendedError>();
        this.promises.set(command.id, { command, handler, options });
        await this.requestSend(command, options, true);
        this.commandTimeout(command, options);

        return handler.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to complete "${command.name}" command: transport is not connected`);
        }

        let request = this.requests.get(command.id) as ITransportAmqpRequestStorage;
        this.requests.delete(command.id);
        if (_.isNil(request)) {
            this.error(`Unable to complete command "${command.name}": probably command was already completed`);
            return;
        }

        if (!this.isCommandAsync(command) || !request.isNeedReply) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            this.channel.ack(request.message);
            return;
        }

        if (this.isRequestExpired(request)) {
            this.logCommand(command, TransportLogType.RESPONSE_EXPIRED);
            this.warn(`Unable to completed "${command.name}" command: timeout is expired`);
            this.channel.ack(request.message);
            return;
        }

        command.response(result);
        this.responseSend(command, request.message);
    }

    public listen<U>(name: string): Observable<U> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to listen "${name}" command: transport is not connected`);
        }

        let item = super.listen<U>(name);
        this.createIfNeed(this.listenQueueForRequest, this.createQueueName(name));
        return item;
    }

    public wait<U>(command: ITransportCommand<U>): void {
        let request = this.requests.get(command.id) as ITransportAmqpRequestStorage;
        if (_.isNil(request)) {
            throw new ExtendedError(`Unable to wait "${command.name}" command: can't find request details`);
        }

        if (this.isRequestWaitExpired(request)) {
            this.complete(command, new TransportWaitExceedError(command));
            return;
        }

        this.channel.nack(request.message, false, false);
        this.waitSend(command, request.waitDelay, request.message);
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        this.eventSend(event);
    }

    public destroy(): void {
        super.destroy();
        this.disconnect();

        this.requests = null;
        this.queueOrExchanger = null;

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
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

        this.logCommand(command, isNeedReply ? TransportLogType.REQUEST_SENDED : TransportLogType.REQUEST_NO_REPLY);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, command));

        let request = this.createRequestOptions(command, options, isNeedReply);
        if (isNeedReply) {
            request.replyTo = await this.createIfNeed(this.listenQueueForReply, this.createQueueReplyName());
        }

        let queue = await this.createIfNeed(this.createQueueForCommand, this.createQueueName(command.name));
        let content = Buffer.from(TransformUtil.fromJSON(TransformUtil.fromClass(request.payload)), 'utf-8');

        try {
            await this.channel.sendToQueue(queue, content, request);
        } catch (error) {
            this.error(new ExtendedError(`Unable to send "${command.name}" command request: ${error.message}`));
        }
    }

    protected async responseSend<U, V>(command: ITransportCommandAsync<U, V>, message: Message): Promise<void> {
        this.logCommand(command, TransportLogType.RESPONSE_SENDED);

        let queue = message.properties.replyTo;
        let response = this.createResponseOptions(command, message);
        let content = Buffer.from(TransformUtil.fromJSON(TransformUtil.fromClass(response.payload)), 'utf-8');

        try {
            await this.channel.sendToQueue(queue, content, response);
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
        let content = Buffer.from(TransformUtil.fromJSON(TransformUtil.fromClass(request.payload)), 'utf-8');
        let exchange = this.eventExchangeName;
        try {
            await this.channel.publish(exchange, '', content);
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
        let waitExchange = this.createWaitExchangeName(waitDelay);
        await this.createIfNeed(this.createExchangeForWait, waitExchange, waitDelay);

        try {
            await this.channel.publish(waitExchange, queue, message.content, message.properties);
        } catch (error) {
            this.complete(command, new ExtendedError(`Unable to send wait "${command.name}" command: ${error.message}`));
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Recevie Methods
    //
    // --------------------------------------------------------------------------

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

        this.logCommand(command, TransportLogType.REQUEST_RECEIVED);
        let request = this.checkRequestStorage(command, payload, message);

        if (this.isRequestExpired(request)) {
            this.logCommand(command, TransportLogType.REQUEST_EXPIRED);
            this.warn(`Received "${command.name}" command with already expired timeout: ignore`);
            this.requests.delete(command.id);
            this.channel.nack(message, false, false);
            return;
        }

        let listener = this.listeners.get(command.name);
        if (_.isNil(listener)) {
            this.complete(command, new ExtendedError(`No listener for "${command.name}" command`));
            return;
        }
        listener.next(command);
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
            this.error(`Invalid response: unable to find command "${payload.id}" (probably timeout already expired)`);
            return;
        }
        let command = promise.command;
        command.response(payload.response);

        // Remove stack from error because it's useless
        if (this.isCommandHasError(command)) {
            command.error.stack = null;
        }

        this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);
        this.commandProcessed(command);
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

    protected checkRequestStorage<U>(command: ITransportCommand<U>, payload: TransportAmqpRequestPayload<U>, message: Message): ITransportAmqpRequestStorage {
        let item = this.requests.get(command.id) as ITransportAmqpRequestStorage;
        if (!_.isNil(item)) {
            item.message = message;
            item.waitCount++;
        } else {
            item = {
                waitCount: 0,
                isNeedReply: payload.isNeedReply,
                expiredDate: payload.isNeedReply ? DateUtil.getDate(Date.now() + this.getCommandTimeoutDelay(command, payload.options)) : null,
                message,
                payload
            };
            item = ObjectUtil.copyProperties(payload.options, item);
            this.requests.set(command.id, item);
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Queue Methods
    //
    // --------------------------------------------------------------------------

    protected async createIfNeed(builder: (name: string, ...params) => Promise<string>, name: string, ...params): Promise<string> {
        if (!_.isNil(name) && this.queueOrExchanger.has(name)) {
            return this.queueOrExchanger.get(name).promise;
        }

        if (_.isEmpty(params)) {
            params = [];
        }
        params.unshift(name);
        let promise = PromiseHandler.create<string, ExtendedError<void>>();
        try {
            name = await builder.apply(this, params);
            promise.resolve(name);
        } catch (error) {
            promise.reject(ExtendedError.create(error));
        }
        this.queueOrExchanger.set(name, promise);
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

    protected listenQueueForEvents = async (exchange: string): Promise<string> => {
        await this.channel.assertExchange(exchange, 'fanout', { durable: false });
        let { queue } = await this.channel.assertQueue('', { exclusive: true });
        await this.channel.bindQueue(queue, exchange, '');
        await this.channel.consume(queue, this.eventMessageReceived, { noAck: true });
        return exchange;
    };

    protected createQueueForCommand = async (name: string): Promise<string> => {
        await this.channel.assertExchange(name, 'direct');
        await this.channel.assertQueue(name, { durable: true });
        await this.channel.bindQueue(name, name, name);
        await this.channel.bindQueue(name, this.deadExchangeName, name);
        return name;
    };

    private createExchangeForWait = async (exchange: string, delay: TransportCommandWaitDelay): Promise<string> => {
        await this.channel.assertExchange(exchange, 'fanout');

        let queue = this.createWaitQueueName(delay);
        await this.channel.assertQueue(queue, { durable: true, deadLetterExchange: this.deadExchangeName, messageTtl: delay });
        await this.channel.bindQueue(queue, exchange, '');
        return exchange;
    };

    private createExchangeForDead = async (exchange: string): Promise<string> => {
        await this.channel.assertExchange(exchange, 'direct');
        return exchange;
    };

    protected createEventOptions<U>(event: ITransportEvent<U>): ITransportAmqpEventOptions<U> {
        let payload = new TransportAmqpEventPayload<U>(event);
        return { payload };
    }

    protected createRequestOptions<U>(command: ITransportCommand<U>, options: ITransportCommandOptions, isNeedReply: boolean): ITransportAmqpRequestOptions<U> {
        let payload = new TransportAmqpRequestPayload<U>();
        payload.options = options;
        payload.isNeedReply = isNeedReply;
        ObjectUtil.copyProperties(command, payload, ['id', 'name', 'request']);

        let request: ITransportAmqpRequestOptions = { payload };
        request.contentType = 'application/json';
        request.contentEncoding = 'utf-8';
        request.timestamp = Date.now();

        if (isNeedReply) {
            request.messageId = request.correlationId = command.id;
            request.expiration = options.timeout;
        }
        return request;
    }

    protected createResponseOptions<U, V>(command: ITransportCommandAsync<U, V>, message: Message): ITransportAmqpResponseOptions<U> {
        return { payload: new TransportAmqpResponsePayload<U, V>(command) };
    }

    protected createQueueName(name: string): string {
        return this.prefixAdd(name);
    }

    protected createQueueReplyName(): string {
        return this.prefixAdd(`${TransportAmqp2.QUEUE_REPLY}.${this.uid}`);
    }

    protected createWaitQueueName(waitDelay: TransportCommandWaitDelay): string {
        return this.prefixAdd(`${TransportAmqp2.QUEUE_WAIT}.${waitDelay}`);
    }

    protected createWaitExchangeName(waitDelay: TransportCommandWaitDelay): string {
        return this.prefixAdd(`${TransportAmqp2.EXCHANGE_WAIT}.${waitDelay}`);
    }

    protected createConnectionUrl(settings: ITransportAmqpSettings): string {
        let value = settings.amqpProtocol + '://' + settings.amqpUserName + ':' + settings.amqpPassword + '@' + settings.amqpHost + ':' + settings.amqpPort;
        if (settings.amqpVhost !== '' && settings.amqpVhost !== '/') {
            value += '/' + settings.amqpVhost;
        }
        return value;
    }

    protected prefixAdd(value: string): string {
        return `${this.settings.amqpQueuePrefix}.${value}`;
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
            await this.createIfNeed(this.createExchangeForDead, this.deadExchangeName);
            await this.createIfNeed(this.listenQueueForEvents, this.eventExchangeName);
            this.connectionConnectCompleteHandler();
        } catch (error) {
            error = ExtendedError.create(error, TransportTimeoutError.ERROR_CODE);
            if (this.connectionAttempts > this.settings.reconnectMaxAttempts) {
                this.connectionConnectErrorHandler(error);
                return;
            }
            await PromiseHandler.delay(this.settings.reconnectDelay);
            this.debug(`Trying to reconnect (attempt ${this.connectionAttempts}): ${error.message}`);
            this.reconnect();
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    protected get deadExchangeName(): string {
        return this.prefixAdd(TransportAmqp2.EXCHANGE_DEAD);
    }

    protected get eventExchangeName(): string {
        return this.prefixAdd(TransportAmqp2.EXCHANGE_EVENT);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isConnected(): boolean {
        return this._isConnected;
    }
}

export interface ITransportAmqpSettings extends IAmqpSettings, ITransportSettings {
    amqpQueuePrefix?: string;

    reconnectDelay?: number;
    reconnectMaxAttempts?: number;
    isExitApplicationOnDisconnect?: boolean;
}

interface ITransportAmqpRequestStorage extends ITransportRequestStorage {
    message: Message;
    payload: TransportAmqpRequestPayload;
}
