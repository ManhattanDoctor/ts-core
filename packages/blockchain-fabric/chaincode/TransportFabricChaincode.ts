import { ExtendedError } from '@ts-core/common/error';
import { ILogger } from '@ts-core/common/logger';
import { PromiseHandler } from '@ts-core/common/promise';
import { Observable } from 'rxjs';
import {
    ITransportCommand,
    ITransportEvent,
    ITransportRequestStorage,
    Transport,
    TransportLogType,
    ITransportSettings,
    ITransportCommandOptions,
    ITransportCommandAsync,
    TransportCommand
} from '@ts-core/common/transport';
import { TransportWaitExceedError } from '@ts-core/common/transport/error';
import { DateUtil, ObjectUtil } from '@ts-core/common/util';
import { ChaincodeStub } from 'fabric-shim';
import * as _ from 'lodash';
import { TransportFabricResponsePayload, TransportFabricRequestPayload } from '../transport';
import { ISignature } from '@ts-core/common/crypto';
import { TransportCryptoManagerFactory } from '@ts-core/common/transport/crypto';
import { IDestroyable } from '@ts-core/common/IDestroyable';

export class TransportFabricChaincode extends Transport<ITransportSettings> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected anonymousCommands: Array<string>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string, anonymousCommands?: Array<string>) {
        super(logger, null, context);
        this.anonymousCommands = anonymousCommands;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        let request = this.requests.get(command.id) as ITransportFabricRequestStorage;
        this.requests.delete(command.id);

        if (_.isNil(request)) {
            this.error(`Unable to complete command "${command.name}", probably command was already completed`);
            return;
        }

        if (this.isRequestExpired(request)) {
            this.logCommand(command, TransportLogType.RESPONSE_EXPIRED);
            let error = new ExtendedError(`Unable to completed "${command.name}" command: timeout is expired`);
            this.warn(error.message);
            request.handler.resolve(TransportFabricResponsePayload.fromError(command.id, error));
            return;
        }

        if (this.isCommandAsync(command)) {
            command.response(result);
        }

        this.logCommand(command, request.isNeedReply ? TransportLogType.RESPONSE_SENDED : TransportLogType.RESPONSE_NO_REPLY);
        request.handler.resolve(new TransportFabricResponsePayload<U, V>(command));
        if (IDestroyable.instanceOf(command)) {
            command.destroy();
        }
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

        this.waitSend(command);
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        this.eventSend(event);
    }

    public getDispatcher<T>(name: string): Observable<T> {
        throw new ExtendedError(`Method is not supported`);
    }

    public send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void {
        throw new ExtendedError(`Method is not supported`);
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        throw new ExtendedError(`Method is not supported`);
    }

    public destroy(): void {
        super.destroy();

        this.requests.forEach((item: ITransportFabricRequestStorage) => item.handler.reject(new ExtendedError(`Chaincode destroyed`)));
        this.requests.clear();
        this.requests = null;

        this.anonymousCommands = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Send Methods
    //
    // --------------------------------------------------------------------------

    protected async eventSend<U>(event: ITransportEvent<U>): Promise<void> {
        this.logEvent(event, TransportLogType.EVENT_SENDED);
    }

    protected async waitSend<U>(command: ITransportCommand<U>): Promise<void> {
        this.logCommand(command, TransportLogType.RESPONSE_WAIT);
    }

    // --------------------------------------------------------------------------
    //
    //  Recevie Message Methods
    //
    // --------------------------------------------------------------------------

    public invoke<U = any>(stub: ChaincodeStub): Promise<TransportFabricResponsePayload<U>> {
        let command: ITransportCommand<U> = null;
        let payload: TransportFabricRequestPayload<U> = null;
        try {
            payload = TransportFabricRequestPayload.parse(stub);
            command = TransportFabricRequestPayload.createCommand(payload, stub, this);
            if (!this.isAnonymousCommand(command)) {
                this.validateSignature(command, payload.options.signature);
            }
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

    protected isAnonymousCommand<U>(command: ITransportCommand<U>): boolean {
        return !_.isEmpty(this.anonymousCommands) && this.anonymousCommands.includes(command.name);
    }

    protected validateSignature<U>(command: ITransportCommand<U>, signature: ISignature): void {
        if (_.isNil(signature)) {
            throw new ExtendedError(`Command "${command.name}" has nil signature`);
        }
        if (_.isNil(signature.nonce)) {
            throw new ExtendedError(`Command "${command.name}" signature has invalid nonce`);
        }
        if (_.isNil(signature.algorithm)) {
            throw new ExtendedError(`Command "${command.name}" signature has invalid algorithm`);
        }
        if (_.isNil(signature.publicKey)) {
            throw new ExtendedError(`Command "${command.name}" signature has invalid publicKey`);
        }
        if (!TransportCryptoManagerFactory.get(signature.algorithm).verify(command, signature)) {
            throw new ExtendedError(`Command "${command.name}" has invalid signature`);
        }
    }
}

interface ITransportFabricRequestStorage<U = any> extends ITransportRequestStorage {
    payload: TransportFabricRequestPayload<U>;
    handler: PromiseHandler<TransportFabricResponsePayload<U>, ExtendedError>;
}
