import { ExtendedError } from '@ts-core/common/error';
import { AxiosError } from 'axios';
import { plainToClass } from 'class-transformer';
import * as _ from 'lodash';
import { ITransportHttpRequest } from './ITransportHttpRequest';

export class TransportHttpResponse<U = any, V = any> {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE_TIMEOUT: number = -2;
    public static ERROR_CODE_NO_CONNECTION: number = -1;

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    protected static isAxiosError(data: any): boolean {
        if (!_.isNil(data)) {
            return _.isBoolean(data.isAxiosError) ? data.isAxiosError : false;
        }
        return false;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _data: V;
    protected _error: ExtendedError;
    protected _request: ITransportHttpRequest<U>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: any, request?: ITransportHttpRequest<U>, locale?: string) {
        this._request = request;
        this.parse(data, locale);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parse(data: any, locale: string): void {
        if (!this.isErrorData(data)) {
            this._data = this.parseData(data, locale);
        } else {
            this._error = this.parseError(data, locale);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected isErrorData(data: any): boolean {
        return data instanceof ExtendedError || ExtendedError.instanceOf(data) || TransportHttpResponse.isAxiosError(data);
    }

    protected parseData(data: any, locale: string): V {
        return data;
    }

    protected parseError(data: any, locale: string): ExtendedError {
        if (data instanceof ExtendedError) {
            return data;
        }
        if (ExtendedError.instanceOf(data)) {
            return plainToClass(ExtendedError, data);
        }
        if (TransportHttpResponse.isAxiosError(data)) {
            return this.createErrorAxios(data);
        }
        return this.createError(data, locale);
    }

    protected createErrorAxios(data: AxiosError): ExtendedError {
        let message = data.message ? data.message.toLocaleLowerCase() : ``;
        if (message.includes(`network error`)) {
            return new ExtendedError(data.message, TransportHttpResponse.ERROR_CODE_NO_CONNECTION);
        }
        if (message.includes(`timeout of`)) {
            return new ExtendedError(data.message, TransportHttpResponse.ERROR_CODE_TIMEOUT);
        }

        let response = data.response;
        if (!_.isNil(response)) {
            if (ExtendedError.instanceOf(response.data)) {
                return plainToClass(ExtendedError, response.data);
            } else {
                return new ExtendedError(response.statusText, response.status, response.data);
            }
        }

        return new ExtendedError(`Unknown error`, ExtendedError.DEFAULT_ERROR_CODE, response ? response.data : null);
    }

    protected createError(data: any, locale: string): ExtendedError {
        return new ExtendedError(`Unknown error`);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get data(): V {
        return this._data;
    }

    public get name(): string {
        return this._request ? this._request.name : null;
    }

    public get error(): ExtendedError {
        return this._error;
    }

    public get request(): ITransportHttpRequest<U> {
        return this._request;
    }

    public get isHandleError(): boolean {
        return this._request ? this._request.isHandleError : false;
    }

    public get isHandleLoading(): boolean {
        return this._request ? this._request.isHandleLoading : false;
    }

    public get isHasError(): boolean {
        return !_.isNil(this._error);
    }
}
