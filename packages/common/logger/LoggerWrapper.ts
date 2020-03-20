import * as _ from 'lodash';
import { IDestroyable } from '../IDestroyable';
import { ILogger, LoggerLevel } from '../logger';
import { ObjectUtil } from '../util';

export class LoggerWrapper implements ILogger, IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _level: LoggerLevel;
    protected _logger: ILogger;
    protected context: any;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger?: ILogger, context?: any, level?: LoggerLevel) {
        this._level = !_.isNil(level) ? level : LoggerLevel.ALL;
        this._logger = logger;
        this.context = context || this.constructor.name;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitLevelProperties(): void {
        if (!_.isString(this.level)) {
            return;
        }

        let level = this.level as string;
        let value = level.toUpperCase();
        if (value in LoggerLevel) {
            this._level = LoggerLevel[value];
        }
    }

    protected commitLoggerProperties(): void {}

    protected parseContext(context: any): any {
        if (!_.isObject(context)) {
            return context;
        }
        let property = 'caller';
        if (!ObjectUtil.hasOwnProperty(context, property)) {
            context[property] = this.constructor.name;
        }
        return context;
    }

    protected isLevelSatisfy(level: LoggerLevel): boolean {
        if (this.level === LoggerLevel.NONE) {
            return false;
        }
        if (this.level === LoggerLevel.ALL) {
            return true;
        }
        return this.level <= level;
    }

    protected logAdd(message: any, context: any): void {
        this.currentLogger.log(message, context);
    }

    protected errorAdd(message: any, trace: string, context: any): void {
        this.currentLogger.error(message, trace, context);
    }

    protected warnAdd(message: any, context: any): void {
        this.currentLogger.warn(message, context);
    }

    protected debugAdd(message: any, context: any): void {
        this.currentLogger.debug(message, context);
    }

    protected verboseAdd(message: any, context: any): void {
        this.currentLogger.verbose(message, context);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public log(message: any, context: any = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.LOG)) {
            return;
        }
        context = this.parseContext(context);
        this.logAdd(message, context);
    }

    public error(message: any, trace?: string, context: any = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.ERROR)) {
            return;
        }

        if (_.isNil(trace) && message instanceof Error) {
            trace = message.stack;
        }
        if (message instanceof Error) {
            message = message.toString();
        }
        context = this.parseContext(context);
        this.errorAdd(message, trace, context);
    }

    public warn(message: any, context: any = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.WARN)) {
            return;
        }
        if (message instanceof Error) {
            message = message.toString();
        }
        context = this.parseContext(context);
        this.warnAdd(message, context);
    }

    public debug(message: any, context: any = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.DEBUG)) {
            return;
        }
        context = this.parseContext(context);
        this.debugAdd(message, context);
    }

    public verbose(message: any, context: any = this.context): void {
        if (!this.isLevelSatisfy(LoggerLevel.VERBOSE)) {
            return;
        }
        context = this.parseContext(context);
        this.verboseAdd(message, context);
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
