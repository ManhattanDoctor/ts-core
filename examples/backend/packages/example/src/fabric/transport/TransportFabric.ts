import { ExtendedError } from '@ts-core/common/error';
import { LoadableEvent } from '@ts-core/common/Loadable';
import { ILogger } from '@ts-core/common/logger';
import { ObservableData } from '@ts-core/common/observer';
import { PromiseHandler } from '@ts-core/common/promise';
import { ITransportCommand, ITransportCommandAsync, ITransportEvent, ITransportRequestStorage, Transport, TransportCommandWaitDelay, TransportLogType, TransportTimeoutError } from '@ts-core/common/transport';
import { TransportWaitExceedError } from '@ts-core/common/transport/error';
import { DateUtil, ObjectUtil, TransformUtil } from '@ts-core/common/util';
import { Channel } from 'fabric-client';
import { Contract, Gateway, InMemoryWallet, Network, Wallet, X509WalletMixin } from 'fabric-network';
import { ChaincodeStub } from 'fabric-shim';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { TransportFabricCryptoManagerEd25519 } from './crypto';
import { ITransportFabricCryptoManager } from './crypto/ITransportFabricCryptoManager';
import { ITransportFabricCommandOptions } from './ITransportFabricCommandOptions';
import { ITransportFabricRequestOptions } from './ITransportFabricRequestOptions';
import { ITransportFabricSettings } from './ITransportFabricSettings';
import { ITransportFabricStub } from './stub';
import { TransportFabricRequestPayload } from './TransportFabricRequestPayload';
import { TransportFabricResponsePayload } from './TransportFabricResponsePayload';

export class TransportFabric extends Transport<ITransportFabricSettings> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    private static CRYPTO_MANAGER: ITransportFabricCryptoManager;

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static get cryptoManager(): ITransportFabricCryptoManager {
        if (!_.isNil(TransportFabric.CRYPTO_MANAGER)) {
            return TransportFabric.CRYPTO_MANAGER;
        }
        TransportFabric.CRYPTO_MANAGER = new TransportFabricCryptoManagerEd25519();
        return TransportFabric.CRYPTO_MANAGER;
    }

    public static get chaincodeMethod(): string {
        return 'fabricTransportExecute';
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private connectionPromise: PromiseHandler<void, ExtendedError>;
    private connectionAttempts: number;

    private network: Network;
    private channel: Channel;
    private contract: Contract;
    private _gateway: Gateway;

    private _wallet: Wallet;
    private _isConnected: boolean;

    public readonlyCommands: Array<string>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: ITransportFabricSettings, context?: string) {
        super(logger, settings, context);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Fabric Methods
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
            this.settings.reconnectMaxAttempts = 0;
        }
        if (!_.isBoolean(this.settings.isExitApplicationOnDisconnect)) {
            this.settings.isExitApplicationOnDisconnect = true;
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
        this.requests.forEach((item: ITransportFabricRequestStorage) => item.handler.reject(error));
        this.requests.clear();

        if (this.connectionPromise) {
            this.connectionPromise.reject(error);
            this.connectionPromise = null;
        }

        this.gateway = null;
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

    public send<U>(command: ITransportCommand<U>, options?: ITransportFabricCommandOptions): void {
        this.requestSend(command, this.getCommandOptions(command, options), false);
    }

    public async sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportFabricCommandOptions): Promise<V> {
        if (this.promises.has(command.id)) {
            return this.promises.get(command.id).handler.promise;
        }

        options = this.getCommandOptions(command, options);

        let handler = PromiseHandler.create<V, ExtendedError>();
        this.promises.set(command.id, { command, handler, options });
        this.requestSend(command, options, true);
        this.commandTimeout(command, options);
        return handler.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        let request = this.requests.get(command.id) as ITransportFabricRequestStorage;
        this.requests.delete(command.id);

        if (_.isNil(request)) {
            this.error(`Unable to complete command "${command.name}", probably command was already completed`);
            return;
        }

        if (!this.isCommandAsync(command) || !request.isNeedReply) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            return;
        }

        if (this.isRequestExpired(request)) {
            this.logCommand(command, TransportLogType.RESPONSE_EXPIRED);
            let error = new ExtendedError(`Unable to completed "${command.name}" command: timeout is expired`);
            this.warn(error.message);
            request.handler.resolve(TransportFabricResponsePayload.fromError(command.id, error));
            return;
        }

        command.response(result);

        this.logCommand(command, TransportLogType.RESPONSE_SENDED);
        request.handler.resolve(new TransportFabricResponsePayload<U, V>(command));
    }

    public listen<U>(name: string): Observable<U> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to listen "${name}" command: transport is not connected`);
        }

        let item = super.listen<U>(name);
        return item;
    }

    public wait<U>(command: ITransportCommand<U>): void {
        let request = this.requests.get(command.id) as ITransportFabricRequestStorage;
        if (_.isNil(request)) {
            throw new ExtendedError(`Unable to wait "${command.name}" command: can't find request details`);
        }

        if (this.isRequestWaitExpired(request)) {
            this.complete(command, new TransportWaitExceedError(command));
            return;
        }

        this.waitSend(command, request.waitDelay);
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        this.eventSend(event);
    }

    public destroy(): void {
        super.destroy();
        this.disconnect();

        this.requests = null;

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

    protected async requestSend<U>(command: ITransportCommand<U>, options: ITransportFabricCommandOptions, isNeedReply: boolean): Promise<void> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to send "${command.name}" command request: transport is not connected`);
        }

        this.logCommand(command, isNeedReply ? TransportLogType.REQUEST_SENDED : TransportLogType.REQUEST_NO_REPLY);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, command));

        let request = this.createRequestOptions(command, options, isNeedReply);

        try {
            let content = TransformUtil.fromJSON(TransformUtil.fromClass(request.payload));
            let transaction = await this.contract.createTransaction(request.method);
            let buffer = await transaction.submit(content);
            this.responseMessageReceived(buffer);
        } catch (error) {
            error = new ExtendedError(`Unable to send "${command.name}" command request: ${error.message}`);
            this.error(error);
            if (!this.isCommandAsync(command)) {
                return;
            }
            command.response(error);
            this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);
            this.commandProcessed(command);
        }
    }

    protected async eventSend<U>(event: ITransportEvent<U>): Promise<void> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to send "${event.name}" event: transport is not connected`);
        }
        this.logEvent(event, TransportLogType.EVENT_SENDED);
    }

    protected async waitSend<U>(command: ITransportCommand<U>, waitDelay: TransportCommandWaitDelay): Promise<void> {
        if (!this.isConnected) {
            throw new ExtendedError(`Unable to send wait "${command.name}" command: transport is not connected`);
        }

        this.logCommand(command, TransportLogType.RESPONSE_WAIT);
    }

    // --------------------------------------------------------------------------
    //
    //  Recevie Message Methods
    //
    // --------------------------------------------------------------------------

    public invokeChaincode<U = any>(stub: ChaincodeStub): Promise<TransportFabricResponsePayload<U>> {
        let command: ITransportCommand<U> = null;
        let payload: TransportFabricRequestPayload<U> = null;
        try {
            payload = TransportFabricRequestPayload.parse(stub);
            command = TransportFabricRequestPayload.createCommand(payload, stub, this.checkSignature(payload));
        } catch (error) {
            error = ExtendedError.create(error);
            this.warn(`Unable to create command: ${error.message}`);
            return Promise.resolve(TransportFabricResponsePayload.fromError(!_.isNil(payload) ? payload.id : null, error));
        }

        this.logCommand(command, TransportLogType.REQUEST_RECEIVED);
        let request = this.checkRequestStorage(command, payload);

        if (this.isRequestExpired(request)) {
            this.logCommand(command, TransportLogType.REQUEST_EXPIRED);
            this.warn(`Received "${command.name}" command with already expired timeout: ignore`);
            this.requests.delete(command.id);
            return;
        }

        let listener = this.listeners.get(command.name);
        if (_.isNil(listener)) {
            this.complete(command, new ExtendedError(`No listener for "${command.name}" command`));
            return request.handler.promise;
        }
        listener.next(command);
        return request.handler.promise;
    }

    protected responseMessageReceived(data: Buffer): void {
        if (_.isNil(data)) {
            this.warn(`Received nil response message`);
            return;
        }

        let payload: TransportFabricResponsePayload = null;
        try {
            payload = TransportFabricResponsePayload.parse(data);
        } catch (error) {
            this.error(error);
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
    }

    protected checkRequestStorage<U>(command: ITransportCommand<U>, payload: TransportFabricRequestPayload<U>): ITransportFabricRequestStorage {
        let item = this.requests.get(command.id) as ITransportFabricRequestStorage;
        if (!_.isNil(item)) {
            item.waitCount++;
        } else {
            item = {
                waitCount: 0,
                isNeedReply: payload.isNeedReply,
                expiredDate: payload.isNeedReply ? DateUtil.getDate(Date.now() + this.getCommandTimeoutDelay(command, payload.options)) : null,
                handler: PromiseHandler.create<TransportFabricResponsePayload<U>, ExtendedError>(),
                payload
            };
            item = ObjectUtil.copyProperties(payload.options, item);
            this.requests.set(command.id, item);
        }
        return item;
    }

    protected checkSignature<U>(payload: TransportFabricRequestPayload<U>): boolean {
        if (!this.isNeedSign(payload.name)) {
            return false;
        }

        if (_.isNil(payload.signature)) {
            throw new ExtendedError(`Command "${payload.name}" has nil signature`);
        }
        if (_.isNil(payload.options) || _.isNil(payload.options.fabricUserPublicKey)) {
            throw new ExtendedError(`Command "${payload.name}" has nil publicKey for verification`);
        }
        if (!this.cryptoManager.verify(payload.request, payload.signature, payload.options.fabricUserPublicKey)) {
            throw new ExtendedError(`Command "${payload.name}" has incorrect signature`);
        }
        return true;
    }

    // --------------------------------------------------------------------------
    //
    //  Queue Methods
    //
    // --------------------------------------------------------------------------

    protected createRequestOptions<U>(
        command: ITransportCommand<U>,
        options: ITransportFabricCommandOptions,
        isNeedReply: boolean
    ): ITransportFabricRequestOptions<U> {
        let payload = new TransportFabricRequestPayload<U>();
        payload.options = ObjectUtil.copyProperties(options, {}, null, ['fabricUserPrivateKey']);
        payload.isNeedReply = isNeedReply;
        ObjectUtil.copyProperties(command, payload, ['id', 'name', 'request']);

        if (this.isNeedSign(command.name)) {
            payload.signature = this.sign(command, options);
        }

        let request: ITransportFabricRequestOptions = { method: TransportFabric.chaincodeMethod, payload };

        return request;
    }

    protected sign<U>(command: ITransportCommand<U>, options: ITransportFabricCommandOptions): string {
        let publicKey = !_.isNil(options.fabricUserPublicKey) ? options.fabricUserPublicKey : this.settings.fabricUserPublicKey;
        let privateKey = !_.isNil(options.fabricUserPrivateKey) ? options.fabricUserPrivateKey : this.settings.fabricUserPrivateKey;

        if (_.isNil(privateKey)) {
            throw new ExtendedError(`Unable to sign "${command.name}" command: private key is nil`);
        }
        if (_.isNil(publicKey)) {
            throw new ExtendedError(`Unable to sign "${command.name}" command: public key is nil`);
        }
        options.fabricUserPublicKey = publicKey;
        return this.cryptoManager.sign(command.request, privateKey);
    }

    protected isNeedSign(name: string): boolean {
        return _.isEmpty(this.readonlyCommands) || !this.readonlyCommands.includes(name);
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

    protected connectionClosedHandler = (error: any): void => {
        console.log('connectionClosedHandler', error);
        this.disconnect(ExtendedError.create(error));
    };

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected get gateway(): Gateway {
        return this._gateway;
    }
    protected set gateway(value: Gateway) {
        if (this._gateway) {
            this.network = null;
            this.channel = null;
            this.contract = null;
            this._gateway.disconnect();
        }
        this._gateway = value;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Amqp Methods
    //
    // --------------------------------------------------------------------------

    protected async reconnect(): Promise<void> {
        this.debug(`Connecting to Fabric "${this.settings.fabricIdentity}:${this.settings.fabricNetworkName}:${this.settings.fabricChaincodeName}"`);

        this.connectionAttempts++;
        try {
            this.gateway = new Gateway();
            await this.gateway.connect(this.settings.fabricConnectionSettingsPath, {
                wallet: await this.getWallet(),
                identity: this.settings.fabricIdentity,
                discovery: { enabled: true, asLocalhost: true }
            });

            this.network = await this.gateway.getNetwork(this.settings.fabricNetworkName);
            this.channel = this.network.getChannel();
            this.contract = this.network.getContract(this.settings.fabricChaincodeName);
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

    protected async getWallet(): Promise<Wallet> {
        if (_.isNil(this._wallet)) {
            this._wallet = new InMemoryWallet();
            await this._wallet.import(
                this.settings.fabricIdentity,
                X509WalletMixin.createIdentity(
                    this.settings.fabricIdentityMspId,
                    this.settings.fabricIdentityCertificate,
                    this.settings.fabricIdentityPrivateKey
                )
            );
        }
        return this._wallet;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isConnected(): boolean {
        return this._isConnected;
    }

    public get cryptoManager(): ITransportFabricCryptoManager {
        return !_.isNil(this.settings.fabricCryptoManager) ? this.settings.fabricCryptoManager : TransportFabric.cryptoManager;
    }
}

interface ITransportFabricRequestStorage<U = any> extends ITransportRequestStorage {
    payload: TransportFabricRequestPayload<U>;
    handler: PromiseHandler<TransportFabricResponsePayload<U>, ExtendedError>;
}

export interface ITransportCommandFabric<U> extends ITransportCommand<U> {
    readonly stub: ITransportFabricStub;
}

export interface ITransportCommandFabricAsync<U, V> extends ITransportCommandFabric<U>, ITransportCommandAsync<U, V> {}
