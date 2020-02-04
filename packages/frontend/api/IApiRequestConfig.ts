import { ApiMethod } from './ApiMethod';

export interface IApiRequestConfig<T = any> {
    data?: T;
    name: string;
    method?: ApiMethod;
    idleTimeout?: number;

    isHandleError?: boolean;
    isHandleLoading?: boolean;
    responseType?: string;
}
