import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method, ResponseType } from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { ObjectUtil } from '../../util';
import { Api } from '../Api';
import { ApiError } from '../ApiError';
import { ApiRequest } from '../ApiRequest';
import { ApiResponse } from '../ApiResponse';
import { HttpApiError } from './HttpApiError';
import { HttpApiResponse } from './HttpApiResponse';
import { IHttpApiRequestConfig } from './IHttpApiRequestConfig';

export abstract class HttpApi extends Api {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    private static isAxiosError(data: any): boolean {
        return !_.isNil(data) ? ObjectUtil.hasOwnProperty(data, 'isAxiosError') : false;
    }

    private static isAxiosResponse(data: any): boolean {
        return !_.isNil(data) ? ObjectUtil.hasOwnProperty(data, 'data') : false;
    }

    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public sid: string;
    public url: string;

    protected defaultMethod: Method = 'post';
    protected defaultResponseType: ResponseType = 'json';

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async send<T>(config: IHttpApiRequestConfig): Promise<ApiResponse<T>> {
        return super.send(config);
    }

    public call<T>(config: IHttpApiRequestConfig): Observable<ApiResponse<T>> {
        return super.call(config);
    }

    // --------------------------------------------------------------------------
    //
    // 	Request Methods
    //
    // --------------------------------------------------------------------------

    protected sendRequestToServer(request: ApiRequest): Promise<any> {
        let axios: AxiosRequestConfig = {} as any;
        let config = request.config as IHttpApiRequestConfig;

        axios.method = (config.method as Method) || this.defaultMethod;
        axios.timeout = config.timeout || this.defaultTimeout;
        axios.responseType = config.responseType || this.defaultResponseType;

        let params = this.createParamsForRequest(request, axios.method);
        if (axios.method.toLowerCase() === 'get') {
            axios.params = params;
        } else {
            axios.data = params;
        }

        axios.url = this.createUrlForRequest(request, axios.method);
        axios.headers = this.createHeadersForRequest(request, axios.method, params);

        return this.makeRequest(axios);
    }

    protected makeRequest(config: AxiosRequestConfig): Promise<AxiosResponse<any>> {
        return axios.request(config);
    }

    // --------------------------------------------------------------------------
    //
    // 	Create Methods
    //
    // --------------------------------------------------------------------------

    protected abstract createUrlForRequest(request: ApiRequest, method: Method): string;

    protected createParamsForRequest(request: ApiRequest, method: Method): any {
        return {};
    }

    protected createHeadersForRequest(request: ApiRequest, method: Method, params: any): any {
        return {};
    }

    // --------------------------------------------------------------------------
    //
    // 	Parse Methods
    //
    // --------------------------------------------------------------------------

    protected parseResponse<T>(data: any, request: ApiRequest): ApiResponse<T> {
        if (HttpApi.isAxiosResponse(data)) {
            data = data.data;
        }
        return this.createResponse(data, request);
    }

    protected parseErrorResponse<T>(error: any, request: ApiRequest): ApiResponse<T> {
        if (HttpApi.isAxiosError(error)) {
            let axios = error as AxiosError;
            let message = axios.message ? axios.message.toLocaleLowerCase() : ``;
            if (message.includes(`network error`)) {
                error = { code: ApiError.CODE_NO_CONNECTION, message: axios.message };
            } else if (message.includes(`timeout of`)) {
                error = { code: ApiError.CODE_TIMEOUT, message: axios.message };
            } else if (!_.isNil(axios.response)) {
                error = axios.response.data;
            }
        }
        return this.parseResponse(this.createError(error, this.locale), request);
    }

    protected createResponse<T>(data: any, request: ApiRequest): ApiResponse<T> {
        return new HttpApiResponse(data, request);
    }

    protected createError(error: any, locale?: string): ApiError {
        return HttpApiError.create(error, locale);
    }
}
