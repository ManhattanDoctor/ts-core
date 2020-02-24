export interface ITransportResponse<T = any> {
    readonly data?: T;

    // Using for show progress and error
    readonly isHandleError?: boolean;
    readonly isHandleLoading?: boolean;
}
