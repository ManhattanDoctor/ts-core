import { ApiMethod } from './ApiMethod';

export interface IApiRequestConfig {
    data?: any;
    name: string;
    method?: ApiMethod;
    idleTimeout?: number;

    isHandleError?: boolean;
    isHandleLoading?: boolean;
    responseType?: string;
}
