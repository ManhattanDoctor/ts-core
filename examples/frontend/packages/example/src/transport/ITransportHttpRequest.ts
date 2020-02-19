import { AxiosRequestConfig } from 'axios';

export interface ITransportHttpRequest<T> extends AxiosRequestConfig {
    name: string;
    data?: T;
    isHandleError?: boolean;
    isHandleLoading?: boolean;
}
