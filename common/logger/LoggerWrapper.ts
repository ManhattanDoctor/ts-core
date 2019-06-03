import * as _ from 'lodash';

export class LoggerWrapper implements ILoggerService {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _logger: ILoggerService;
    protected context: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger?: ILoggerService, context?: string) {
        this._logger = logger;
        this.context = context || this.constructor.name;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitLoggerProperties(): void {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public log(message: any, context: string = this.context): any {
        this.currentLogger.log(message, context);
    }

    public error(message: any, trace?: string, context: string = this.context): any {
        if (_.isNil(trace) && message instanceof Error) {
            trace = message.stack;
        }
        if (message instanceof Error) {
            message = message.toString();
        }
        this.currentLogger.error(message, trace, context);
    }

    public warn(message: any, context: string = this.context): any {
        if (message instanceof Error) {
            message = message.toString();
        }
        this.currentLogger.warn(message, context);
    }

    public debug(message: any, context: string = this.context) {
        this.currentLogger.debug(message, context);
    }

    public verbose(message: any, context: string = this.context) {
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

    protected get currentLogger(): ILoggerService {
        return this._logger || console;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get logger(): ILoggerService {
        return this._logger;
    }
    public set logger(value: ILoggerService) {
        if (value === this._logger) {
            return;
        }
        this._logger = value;
        if (!_.isNil(value)) {
            this.commitLoggerProperties();
        }
    }
}

export interface ILoggerService {
    log(message: any, context?: string): any;
    error(message: any, trace?: string, context?: string): any;
    warn(message: any, context?: string): any;
    debug?(message: any, context?: string): any;
    verbose?(message: any, context?: string): any;
}
