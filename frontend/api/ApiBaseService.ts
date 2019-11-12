import { HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { Destroyable } from '../../common/Destroyable';
import { ApiMethod } from './ApiMethod';
import { ObservableData } from '../../common/observer';
import { LoadableEvent } from '../../common';
import { ApiRequest } from './ApiRequest';
import { ApiResponse } from './ApiResponse';
import { IApiRequestConfig } from './IApiRequestConfig';

export abstract class ApiBaseService extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static IDLE_TIMEOUT = 30000;

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    public sid: string;
    public url: string;
    public locale: string;

    protected _isLoading: boolean;

    protected idleTimeout: number = ApiBaseService.IDLE_TIMEOUT;
    protected responseType: string = 'json';
    protected defaultMethod: ApiMethod = ApiMethod.POST;
    protected observer: Subject<ObservableData<LoadableEvent, ApiRequest | ApiResponse>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor() {
        super();
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected sendRequest(request: ApiRequest, resolve?: any, reject?: any, observer?: any): void {
        this._isLoading = true;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, request));

        let subscription = this.sendRequestToServer(request).subscribe(
            response => {
                subscription.unsubscribe();

                let apiResponse = this.parseResponse(response, request);
                this._isLoading = false;
                this.observer.next(new ObservableData(LoadableEvent.FINISHED, apiResponse));

                if (observer) {
                    observer.next(apiResponse);
                    observer.complete();
                }

                if (apiResponse.isHasError) {
                    if (reject) {
                        reject(apiResponse);
                    }
                    this.observer.next(new ObservableData(LoadableEvent.ERROR, apiResponse, apiResponse.error));
                } else {
                    if (resolve) {
                        resolve(apiResponse);
                    }
                    this.observer.next(new ObservableData(LoadableEvent.COMPLETE, apiResponse));
                }
            },
            error => {
                subscription.unsubscribe();

                let apiResponse = this.parseErrorResponse(error, request);
                if (reject) {
                    reject(apiResponse);
                }

                this._isLoading = false;
                this.observer.next(new ObservableData(LoadableEvent.FINISHED, apiResponse));

                if (observer) {
                    observer.next(apiResponse);
                    observer.complete();
                }

                this.observer.next(new ObservableData(LoadableEvent.ERROR, apiResponse, apiResponse.error));
            }
        );
    }

    protected sendRequestToServer(request: ApiRequest): Observable<any> {
        let method = request.method || this.defaultMethod;

        let url = this.createUrlForRequest(request, method);
        let params = this.createParamsForRequest(request, method);
        let headers = this.createHeadersForRequest(request, method, params);
        let idleTimeout = request.idleTimeout || this.idleTimeout;
        let responseType = request.responseType || this.responseType;
        return this.makeRequest(url, method, params, headers, idleTimeout, responseType);
    }

    protected abstract makeRequest(
        url: string,
        method: ApiMethod,
        params: HttpParams,
        headers: HttpHeaders,
        idleTimeout: number,
        responseType: string
    ): Observable<any>;

    protected convertToParams(params: any): HttpParams {
        let value: HttpParams = new HttpParams();
        if (!params) {
            return;
        }
        Object.keys(params).forEach(key => (value = value.append(key, params[key])));
        return value;
    }

    // --------------------------------------------------------------------------
    //
    // 	Create Methods
    //
    // --------------------------------------------------------------------------

    protected abstract createUrlForRequest(request: ApiRequest, method: ApiMethod): string;

    protected abstract createParamsForRequest(request: ApiRequest, method: ApiMethod): HttpParams;

    protected abstract createHeadersForRequest(request: ApiRequest, method: ApiMethod, body: HttpParams): HttpHeaders;

    // --------------------------------------------------------------------------
    //
    // 	Parse Methods
    //
    // --------------------------------------------------------------------------

    protected abstract parseResponse<T>(data: any, request: ApiRequest): ApiResponse<T>;

    protected abstract parseErrorResponse<T>(error: HttpErrorResponse, request: ApiRequest): ApiResponse<T>;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async send<T>(param: IApiRequestConfig): Promise<ApiResponse<T>> {
        if (_.isNil(param.isHandleLoading)) {
            param.isHandleLoading = false;
        }
        if (_.isNil(param.isHandleError)) {
            param.isHandleError = true;
        }

        return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.sendRequest(new ApiRequest(param), resolve, reject);
        });
    }

    public call<T>(param: IApiRequestConfig): Observable<ApiResponse<T>> {
        if (_.isNil(param.isHandleLoading)) {
            param.isHandleLoading = false;
        }
        if (_.isNil(param.isHandleError)) {
            param.isHandleError = true;
        }

        return new Observable(observer => {
            this.sendRequest(new ApiRequest(param), null, null, observer);
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
