export interface ILogger {
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug?(message: any, context?: string): void;
    verbose?(message: any, context?: string): void;
}

export enum LoggerLevel {
    ALL = 10,
    NONE = 0,

    ERROR = 5,
    WARN = 4,
    LOG = 3,
    DEBUG = 2,
    VERBOSE = 1
}
