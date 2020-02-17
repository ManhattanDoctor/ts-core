import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { Destroyable } from '../Destroyable';
import { LoadableEvent } from '../Loadable';
import { ObservableData } from '../observer';
import { PromiseHandler } from '../promise';
import { DateUtil } from '../util';
import { ApiRequest } from './ApiRequest';
import { ApiResponse } from './ApiResponse';
import { IApi } from './IApi';
import { IApiRequestConfig } from './IApiRequestConfig';

export abstract class Api extends Destroyable implements IApi {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static TIMEOUT = 30 * DateUtil.MILISECONDS_SECOND;

    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public locale: string;
    public defaultTimeout: number = Api.TIMEOUT;

    protected _isLoading: boolean;
    protected observer: Subject<ObservableData<LoadableEvent, ApiRequest | ApiResponse>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async sendRequest<T>(request: ApiRequest): Promise<ApiResponse<T>> {
        this._isLoading = true;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, request));

        let response: ApiResponse<T> = null;

        try {
            response = this.parseResponse(await this.sendRequestToServer(request), request);
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, response));
        } catch (error) {
            response = this.parseErrorResponse(error, request);
        }

        this._isLoading = false;
        if (response.isHasError) {
            this.observer.next(new ObservableData(LoadableEvent.ERROR, response, response.error));
        }
        this.observer.next(new ObservableData(LoadableEvent.FINISHED, response));
        return response;
    }

    protected abstract sendRequestToServer(request: ApiRequest): Promise<any>;

    protected transformRequestConfig<T>(config: IApiRequestConfig<T>): IApiRequestConfig<T> {
        if (_.isNil(config.isHandleLoading)) {
            config.isHandleLoading = false;
        }
        if (_.isNil(config.isHandleError)) {
            config.isHandleError = true;
        }
        return config;
    }

    // --------------------------------------------------------------------------
    //
    // 	Parse Methods
    //
    // --------------------------------------------------------------------------

    protected abstract parseResponse<T>(data: any, request: ApiRequest): ApiResponse<T>;

    protected abstract parseErrorResponse<T>(error: any, request: ApiRequest): ApiResponse<T>;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async send<T>(config: IApiRequestConfig): Promise<ApiResponse<T>> {
        let promise = PromiseHandler.create<ApiResponse<T>, ApiResponse<T>>();
        this.sendRequest<T>(new ApiRequest(this.transformRequestConfig(config))).then(response => {
            if (response.isHasError) {
                promise.reject(response);
            } else {
                promise.resolve(response);
            }
        });
        return promise.promise;
    }

    public call<T>(config: IApiRequestConfig): Observable<ApiResponse<T>> {
        return new Observable<ApiResponse<T>>(observer => {
            this.sendRequest<T>(new ApiRequest(this.transformRequestConfig(config))).then(response => {
                observer.next(response);
                observer.complete();
            });
        });
    }

    public destroy(): void {
        this.observer = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public get events(): Observable<ObservableData<LoadableEvent, ApiRequest | ApiResponse>> {
        return this.observer.asObservable();
    }
}
