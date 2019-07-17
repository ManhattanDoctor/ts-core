import { ILogger } from './ILogger';

export abstract class Logger implements ILogger {
    public abstract log(message: any, context?: string): any;
    public abstract error(message: any, trace?: string, context?: string): any;
    public abstract warn(message: any, context?: string): any;
    public abstract debug?(message: any, context?: string): any;
    public abstract verbose?(message: any, context?: string): any;
}
