import axios from 'axios';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { LoadableEvent } from '../../../common';
import { ExtendedError } from '../../../common/error';
import { ILogger } from '../../../common/logger';
import { ObservableData } from '../../../common/observer';
import { PromiseHandler } from '../../../common/promise';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent, Transport, TransportLogType } from '../../../common/transport';
import { ITransportHttpRequest } from './ITransportHttpRequest';
import { ITransportHttpSettings } from './ITransportHttpSettings';

export class TransportHttp extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public defaults: ITransportHttpSettings;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);
        this.observer = new Subject();
        this.defaults = { method: 'get', headers: {}, isHandleLoading: true, isHandleError: true };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>): void {
        this.requestSend(command);
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        let promise = this.promises.get(command.id);
        if (promise) {
            return promise.promise;
        }

        promise = PromiseHandler.create();
        this.promises.set(command.id, promise);
        this.requestSend(command, options);
        return promise.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        if (!this.isCommandAsync(command)) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            return;
        }

        let async = command as ITransportCommandAsync<U, any>;
        async.response(result);
        this.responseSend(async);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public listen<U>(name: string): Observable<U> {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public getDispatcher<T>(name: string): Observable<T> {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public destroy(): void {
        super.destroy();
        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async requestSend<U, V>(command: ITransportCommand<U>, options?: ITransportCommandOptions): Promise<void> {
        this.prepareCommand(command, options);

        let request = command.request;

        this.logCommand(command, TransportLogType.REQUEST_SENDED);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, request));

        let result: V | Error = null;
        try {
            result = (await axios.create(this.defaults).request<V>(request)).data;
        } catch (error) {
            result = error;
        }
        this.complete(command, result);
    }

    private responseSend<U, V>(command: ITransportCommandAsync<U, V>): void {
        // Immediately receive the commad
        this.responseReceived(command);
    }

    private responseReceived<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);

        let promise = this.promises.get(command.id);
        if (_.isNil(promise)) {
            return;
        }

        this.options.delete(command.id);
        this.promises.delete(command.id);
        if (this.isCommandHasError(command)) {
            promise.reject(command.error);
            this.observer.next(new ObservableData(LoadableEvent.ERROR, command, command.error));
        } else {
            promise.resolve(command.data);
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, command));
        }
        this.observer.next(new ObservableData(LoadableEvent.FINISHED, command));
    }

    protected prepareCommand<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void {
        if (_.isNil(this.defaults)) {
            throw new ExtendedError(`Defaults is undefined`);
        }
        if (_.isNil(this.defaults.method)) {
            throw new ExtendedError(`Defaults method is undefined`);
        }
        if (_.isNil(this.defaults.baseURL)) {
            throw new ExtendedError(`Defaults baseUrl is undefined`);
        }

        let request = command.request as ITransportHttpRequest;
        request.timeout = this.getCommandTimeout(command, options);

        if (_.isNil(request.url)) {
            request.url = command.name;
        }
        if (_.isNil(request.method)) {
            request.method = this.defaults.method;
        }
        if (_.isNil(request.isHandleError)) {
            request.isHandleError = this.defaults.isHandleError;
        }
        if (_.isNil(request.isHandleLoading)) {
            request.isHandleLoading = this.defaults.isHandleLoading;
        }

        if (request.method.toLowerCase() === 'get') {
            request.params = request.data;
            delete request.data;
        }
    }
}
