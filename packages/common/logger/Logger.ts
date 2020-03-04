import { ILogger } from './ILogger';

export abstract class Logger implements ILogger {
    public abstract log(message: any, context?: any): any;
    public abstract error(message: any, trace?: any, context?: any): any;
    public abstract warn(message: any, context?: any): any;
    public abstract debug?(message: any, context?: any): any;
    public abstract verbose?(message: any, context?: any): any;
}
