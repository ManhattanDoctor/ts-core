import axios, { AxiosError } from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LoadableEvent } from '../../../common';
import { ExtendedError } from '../../../common/error';
import { ILogger } from '../../../common/logger';
import { ObservableData } from '../../../common/observer';
import { PromiseHandler } from '../../../common/promise';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent, Transport, TransportLogType } from '../../../common/transport';
import { TransformUtil } from '../../util';
import { TransportNoConnectionError, TransportTimeoutError } from '../error';
import { ITransportHttpRequest } from './ITransportHttpRequest';
import { ITransportHttpSettings } from './ITransportHttpSettings';

export class TransportHttp extends Transport<ITransportHttpSettings> {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static isError(data: any): boolean {
        return data instanceof ExtendedError || ExtendedError.instanceOf(data) || TransportHttp.isAxiosError(data);
    }

    public static isAxiosError(data: any): boolean {
        if (!_.isNil(data)) {
            return _.isBoolean(data.isAxiosError) ? data.isAxiosError : false;
        }
        return false;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public settings: ITransportHttpSettings;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: ITransportHttpSettings, context?: string) {
        super(logger, settings, context);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void {
        this.requestSend(command, this.getCommandOptions(command, options));
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        if (this.promises.has(command.id)) {
            return this.promises.get(command.id).handler.promise;
        }

        options = this.getCommandOptions(command, options);

        let handler = PromiseHandler.create<V, ExtendedError>();
        this.promises.set(command.id, { command, handler, options });
        this.requestSend(command, options);
        return handler.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        if (!this.isCommandAsync(command)) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            return;
        }
        command.response(result);
        this.responseSend(command);
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

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    protected isError(data: any): boolean {
        return TransportHttp.isError(data);
    }

    protected parseError<U>(data: any, command: ITransportCommand<U>): ExtendedError {
        if (data instanceof ExtendedError) {
            return data;
        }
        if (ExtendedError.instanceOf(data)) {
            return TransformUtil.toClass(ExtendedError, data);
        }
        if (TransportHttp.isAxiosError(data)) {
            return this.parseAxiosError(data, command);
        }
        return new ExtendedError(`Unknown error`, ExtendedError.DEFAULT_ERROR_CODE, data);
    }

    protected parseAxiosError<U, V>(data: AxiosError, command: ITransportCommand<U>): ExtendedError {
        let message = data.message ? data.message.toLocaleLowerCase() : ``;
        if (message.includes(`network error`)) {
            return new TransportNoConnectionError(command);
        }
        if (message.includes(`timeout of`)) {
            return new TransportTimeoutError(command);
        }
        let response = data.response;
        if (!_.isNil(response)) {
            if (ExtendedError.instanceOf(response.data)) {
                return TransformUtil.toClass(ExtendedError, response.data);
            } else {
                return new ExtendedError(response.statusText, response.status, response.data);
            }
        }
        return new ExtendedError(`Unknown axios error`, ExtendedError.DEFAULT_ERROR_CODE, data);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async requestSend<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): Promise<void> {
        this.prepareCommand(command, options);

        this.logCommand(command, this.isCommandAsync(command) ? TransportLogType.REQUEST_SENDED : TransportLogType.REQUEST_NO_REPLY);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, command));
        let result = null;

        try {
            result = (await axios.create(this.settings).request(command.request)).data;
        } catch (error) {
            result = error;
        }
        this.complete(command, this.isError(result) ? this.parseError(result, command) : result);
    }

    protected responseSend<U, V>(command: ITransportCommandAsync<U, V>): void {
        // Immediately receive the commad
        this.responseReceived(command);
    }

    protected responseReceived<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);
        this.commandProcessed(command);
    }

    protected prepareCommand<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): void {
        if (_.isNil(this.settings)) {
            throw new ExtendedError(`Settings is undefined`);
        }
        if (_.isNil(this.settings.method)) {
            throw new ExtendedError(`Defaults method is undefined`);
        }
        if (_.isNil(this.settings.baseURL)) {
            throw new ExtendedError(`Defaults baseUrl is undefined`);
        }

        let request = command.request as ITransportHttpRequest;
        request.timeout = options.timeout;

        if (_.isNil(request.url)) {
            request.url = command.name;
        }
        if (_.isNil(request.method)) {
            request.method = this.settings.method;
        }
        if (_.isNil(request.isHandleError && this.settings.isHandleError)) {
            request.isHandleError = this.settings.isHandleError;
        }
        if (_.isNil(request.isHandleLoading) && this.settings.isHandleLoading) {
            request.isHandleLoading = this.settings.isHandleLoading;
        }

        if (request.method.toLowerCase() === 'get') {
            request.params = request.data;
            delete request.data;
        }
    }
}
