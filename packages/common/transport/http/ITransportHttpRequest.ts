import { AxiosRequestConfig } from 'axios';
import { ITransportRequest } from '../ITransportRequest';

export interface ITransportHttpRequest<T = any> extends ITransportRequest, AxiosRequestConfig {
    data?: T;
}
