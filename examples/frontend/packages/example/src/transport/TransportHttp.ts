import { LoadableEvent } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { ILogger } from '@ts-core/common/logger';
import { ObservableData } from '@ts-core/common/observer';
import { PromiseHandler } from '@ts-core/common/promise';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent, Transport, TransportLogType } from '@ts-core/common/transport';
import axios, { AxiosRequestConfig } from 'axios';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ITransportHttpRequest } from './ITransportHttpRequest';
import { TransportHttpCommand } from './TransportHttpCommand';
import { TransportHttpCommandAsync } from './TransportHttpCommandAsync';
import { TransportHttpResponse } from './TransportHttpResponse';

export class TransportHttp extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public defaults: AxiosRequestConfig;
    protected observer: Subject<ObservableData<LoadableEvent, ITransportHttpRequest<any> | TransportHttpResponse>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>): void {
        if (!(command instanceof TransportHttpCommand)) {
            throw new ExtendedError(`Command must be instance of TransportHttpCommand`);
        }

        this.logCommand(command, TransportLogType.REQUEST_SEND);
        this.prepareCommand(command);
        this.request(command.request);
    }

    public async sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        if (!(command instanceof TransportHttpCommandAsync)) {
            throw new ExtendedError(`Command must be instance of TransportHttpCommandAsync`);
        }

        this.logCommand(command, TransportLogType.REQUEST_SEND);
        this.prepareCommand(command);

        let promise = PromiseHandler.create<V, ExtendedError>();
        try {
            promise.resolve(await this.request<U, V>(command.request));
        } catch (error) {
            promise.reject(error);
        }
        return promise.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        throw new ExtendedError(`Method doesn't implemented`);
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
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async request<U, V>(request: ITransportHttpRequest<U>): Promise<V> {
        this.observer.next(new ObservableData(LoadableEvent.STARTED, request));

        let result: V | Error = null;
        try {
            result = (await axios.create(this.defaults).request<V>(request)).data;
        } catch (error) {
            result = error;
        }

        let promise = PromiseHandler.create<V, ExtendedError>();
        let response = this.createResponse(result, request);
        if (!response.isHasError) {
            promise.resolve(response.data);
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, response));
        } else {
            promise.reject(response.error);
            this.observer.next(new ObservableData(LoadableEvent.ERROR, response, response.error));
        }

        this.observer.next(new ObservableData(LoadableEvent.FINISHED, response));
        return promise.promise;
    }

    protected createResponse<U, V>(response: V | Error, request: ITransportHttpRequest<U>): TransportHttpResponse<U, V> {
        return new TransportHttpResponse(response, request);
    }

    protected prepareCommand<U, V = any>(command: TransportHttpCommand<U> | TransportHttpCommandAsync<U, V>, options?: ITransportCommandOptions): void {
        if (_.isNil(this.defaults) || _.isNil(this.defaults.baseURL)) {
            throw new ExtendedError(`Defaults or baseUrl is Nil`);
        }

        let request = command.request;
        if (!_.isNil(this.defaults.method) && _.isNil(request.method)) {
            request.method = this.defaults.method;
        }
        if (!_.isNil(options) && _.isNumber(options.waitTimeout)) {
            request.timeout = options.waitTimeout;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LoadableEvent, ITransportHttpRequest<any> | TransportHttpResponse>> {
        return this.observer.asObservable();
    }
}
