import * as _ from 'lodash';
import { ApiError } from './ApiError';
import { ApiRequest } from './ApiRequest';

export abstract class ApiResponse<U = any, V = any> {
    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _data: U;
    protected _error: ApiError;
    protected _request: ApiRequest<V>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: any, request?: ApiRequest, locale?: string) {
        this._request = request;
        this.parse(data, locale);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parse(data: any, locale: string): void {
        this._data = this.parseData(data, locale);
        if (this.isErrorData(data)) {
            this._error = this.parseError(data, locale);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseData(data: any, locale: string): U {
        return data;
    }

    protected parseError(data: any, locale: string): ApiError {
        return data instanceof ApiError ? data : this.createError(data, locale);
    }

    protected isErrorData(data: any): boolean {
        return data instanceof ApiError;
    }

    protected abstract createError(data: any, locale: string): ApiError;

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get data(): U {
        return this._data;
    }

    public get name(): string {
        return this._request ? this._request.config.name : null;
    }

    public get error(): ApiError {
        return this._error;
    }

    public get request(): ApiRequest {
        return this._request;
    }

    public get isHandleError(): boolean {
        return this._request ? this._request.config.isHandleError : false;
    }

    public get isHandleLoading(): boolean {
        return this._request ? this._request.config.isHandleLoading : false;
    }

    public get isHasError(): boolean {
        return !_.isNil(this._error);
    }
}
