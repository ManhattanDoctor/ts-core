import { Method, ResponseType } from 'axios';
import { IApiRequestConfig } from '../IApiRequestConfig';

export interface IHttpApiRequestConfig<T = any> extends IApiRequestConfig<T> {
    method?: Method | string;
    responseType?: ResponseType;
}
