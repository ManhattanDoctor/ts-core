export interface ILogger {
    log(message: any, context?: any): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: any): void;
    debug?(message: any, context?: any): void;
    verbose?(message: any, context?: any): void;
}
