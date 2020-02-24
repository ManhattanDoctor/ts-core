import { AxiosRequestConfig } from 'axios';

export interface ITransportHttpSettings extends AxiosRequestConfig {
    isHandleError?: boolean;
    isHandleLoading?: boolean;
}
