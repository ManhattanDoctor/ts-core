export interface IApiRequestConfig<T = any> {
    data?: T;
    name: string;
    timeout?: number;
    isHandleError?: boolean;
    isHandleLoading?: boolean;
}
