import { ILogger, LoggerLevel } from '../../common/logger/ILogger';

export interface ILoggerSettings {
    readonly logger?: ILogger;
    readonly loggerLevel: LoggerLevel;
}
