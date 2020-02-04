import { ApiError } from './ApiError';
import { ApiRequest } from './ApiRequest';

export class ApiResponse<T = any> {
    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _data: T;
    protected _name: string;

    protected _error: ApiError | null;
    protected _request: ApiRequest;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: any, request?: ApiRequest, language?: string) {
        this._request = request;
        if (request) {
            this._name = request.name;
        }
        this.parse(data, language);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parse(data: any, language: string): void {
        this._data = this.parseData(data, language);
        if (this.isErrorData(data)) {
            this._error = this.parseError(data, language);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseData(data: any, language: string): T | null {
        return data;
    }

    protected parseError(data: any, language: string): ApiError | null {
        return data instanceof ApiError ? data : this.createError(data, language);
    }

    protected createError(data: any, language: string): ApiError {
        return new ApiError(data.error, language);
    }

    protected isErrorData(data: any): boolean {
        if (data instanceof ApiError) {
            return true;
        }
        return data ? data.hasOwnProperty('error') : false;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get data(): T {
        return this._data;
    }

    public get name(): string {
        return this._name;
    }

    public get error(): ApiError {
        return this._error;
    }

    public get request(): ApiRequest {
        return this._request;
    }

    public get isHandleError(): boolean {
        return this._request ? this._request.isHandleError : false;
    }

    public get isHandleLoading(): boolean {
        return this._request ? this._request.isHandleLoading : false;
    }

    public get isHasError(): boolean {
        return this._error != null;
    }
}
