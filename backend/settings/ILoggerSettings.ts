import { ILogger, LoggerLevel } from '@ts-core/common/logger/ILogger';

export interface ILoggerSettings {
    readonly logger?: ILogger;
    readonly loggerLevel: LoggerLevel;
}
