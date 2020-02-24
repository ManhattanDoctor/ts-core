export interface ITransportRequest {
    [key: string]: any;
    // Using for show progress and error
    isHandleError?: boolean;
    isHandleLoading?: boolean;
}
