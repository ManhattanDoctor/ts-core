import * as _ from 'lodash';
import { IDestroyable } from '../IDestroyable';
import { ILogger, LoggerLevel } from './ILogger';

export class LoggerWrapper implements ILogger, IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _level: LoggerLevel;
    protected _logger: ILogger;
    protected context: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger?: ILogger, context?: string, level?: LoggerLevel) {
        this._level = !_.isNil(level) ? level : LoggerLevel.ALL;
        this._logger = logger;
        this.context = context || this.constructor.name;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitLevelProperties(): void {}

    protected commitLoggerProperties(): void {}

    private isLevelSatisfy(level: LoggerLevel): boolean {
        if (this.level === LoggerLevel.NONE) {
            return false;
        }
        if (this.level === LoggerLevel.ALL) {
            return true;
        }
        return this.level <= level;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public log(message: any, context: string = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.LOG)) {
            return;
        }
        this.currentLogger.log(message, context);
    }

    public error(message: any, trace?: string, context: string = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.ERROR)) {
            return;
        }

        if (_.isNil(trace) && message instanceof Error) {
            trace = message.stack;
        }
        if (message instanceof Error) {
            message = message.toString();
        }
        this.currentLogger.error(message, trace, context);
    }

    public warn(message: any, context: string = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.WARN)) {
            return;
        }

        if (message instanceof Error) {
            message = message.toString();
        }
        this.currentLogger.warn(message, context);
    }

    public debug(message: any, context: string = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.DEBUG)) {
            return;
        }
        this.currentLogger.debug(message, context);
    }

    public verbose(message: any, context: string = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.VERBOSE)) {
            return;
        }
        this.currentLogger.verbose(message, context);
    }

    public destroy(): void {
        this.logger = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected get currentLogger(): ILogger {
        return this._logger || console;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get logger(): ILogger {
        return this._logger;
    }
    public set logger(value: ILogger) {
        if (value === this._logger) {
            return;
        }
        this._logger = value;
        if (value) {
            this.commitLoggerProperties();
        }
    }

    public get level(): LoggerLevel {
        return this._level;
    }
    public set level(value: LoggerLevel) {
        if (value === this._level) {
            return;
        }
        this._level = value;
        if (!_.isNil(value)) {
            this.commitLevelProperties();
        }
    }
}
