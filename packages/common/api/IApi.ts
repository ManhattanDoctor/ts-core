import { Observable } from 'rxjs';
import { IDestroyable } from '../IDestroyable';
import { ApiResponse } from './ApiResponse';
import { IApiRequestConfig } from './IApiRequestConfig';

export interface IApi extends IDestroyable {
    send<T>(config: IApiRequestConfig): Promise<ApiResponse<T>>;
    call<T>(config: IApiRequestConfig): Observable<ApiResponse<T>>;
}
