import { ILogger, LoggerLevel } from '@ts-core/common/logger';

export interface ILoggerSettings {
    readonly logger?: ILogger;
    readonly loggerLevel: LoggerLevel;
}
