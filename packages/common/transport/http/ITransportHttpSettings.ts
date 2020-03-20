import { AxiosRequestConfig } from 'axios';
import { ITransportSettings } from '../ITransportSettings';

export interface ITransportHttpSettings extends AxiosRequestConfig, ITransportSettings {
    isHandleError?: boolean;
    isHandleLoading?: boolean;
}
