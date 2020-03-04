import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as util from 'util';
import { ExtendedError } from '../error';
import { LoadableEvent } from '../Loadable';
import { ILogger, LoggerWrapper } from '../logger';
import { ObservableData } from '../observer';
import { PromiseHandler } from '../promise';
import { DateUtil, ObjectUtil } from '../util';
import { TransportTimeoutError } from './error';
import { ITransport, ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent, TransportCommandWaitDelay } from './ITransport';

export abstract class Transport extends LoggerWrapper implements ITransport {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_TIMEOUT = 30 * DateUtil.MILISECONDS_SECOND;

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static isCommandAsync<U, V = any>(command: ITransportCommand<U>): command is ITransportCommandAsync<U, V> {
        return ObjectUtil.instanceOf(command, ['id', 'name', 'response']);
    }

    public static isCommandHasError<U>(command: ITransportCommand<U>): boolean {
        return Transport.isCommandAsync(command) && !_.isNil(command.error);
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected promises: Map<string, ITransportPromise>;
    protected listeners: Map<string, Subject<any>>;
    protected dispatchers: Map<string, Subject<any>>;

    protected observer: Subject<ObservableData<LoadableEvent, ITransportCommand<any>>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);

        this.observer = new Subject();

        this.promises = new Map();
        this.listeners = new Map();
        this.dispatchers = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Abstract Methods
    //
    // --------------------------------------------------------------------------

    public abstract send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void;
    public abstract sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V>;

    public abstract wait<U>(command: ITransportCommand<U>): void;
    public abstract complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void;

    public abstract dispatch<T>(event: ITransportEvent<T>): void;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public listen<U>(name: string): Observable<U> {
        if (this.listeners.has(name)) {
            throw new ExtendedError(`Command "${name}" already listening`);
        }
        let item = new Subject<U>();
        this.listeners.set(name, item);

        this.logListen(name);
        return item.asObservable();
    }

    public getDispatcher<T>(name: string): Observable<T> {
        let item = this.dispatchers.get(name);
        if (_.isNil(item)) {
            item = new Subject<T>();
            this.dispatchers.set(name, item);
        }
        return item.asObservable().pipe(tap(event => this.logEvent(event, TransportLogType.EVENT_RECEIVED)));
    }

    public destroy(): void {
        super.destroy();

        if (this.listeners) {
            this.listeners.forEach(item => item.complete());
            this.listeners.clear();
            this.listeners = null;
        }

        if (this.dispatchers) {
            this.dispatchers.forEach(item => item.complete());
            this.dispatchers.clear();
            this.dispatchers = null;
        }

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }

        this.promises.clear();
        this.promises = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private eventToString<U>(event: ITransportEvent<U>, type: TransportLogType): string {
        return `${this.getLogMark(type)} ${event.name}`;
    }

    private commandToString<U>(command: ITransportCommand<U>, type: TransportLogType): string {
        let prefix = this.getLogMark(type);
        let suffix = '•';
        if (this.isCommandAsync(command) && (!_.isNil(command.error) || !_.isNil(command.data))) {
            suffix = !this.isCommandHasError(command) ? '✔' : '✘';
        }
        return `${prefix} ${command.name} ${suffix} (${command.id})`;
    }

    private verboseData<U>(data: U, type: TransportLogType): void {
        if (_.isNil(data)) {
            return;
        }
        this.verbose(`${this.getLogMark(type)} ${util.inspect(data, { colors: true, showHidden: false, depth: null, compact: false })}`);
    }

    private logRequest<U>(command: ITransportCommand<U>, type: TransportLogType): void {
        if (!_.isNil(command)) {
            this.verboseData(command.request, type);
        }
    }
    private logResponse<U>(command: ITransportCommand<U>, type: TransportLogType): void {
        if (_.isNil(command) || !this.isCommandAsync(command)) {
            return;
        }
        this.verboseData(this.isCommandHasError(command) ? command.error : command.data, type);
    }

    private getLogMark(type: TransportLogType): string {
        switch (type) {
            case TransportLogType.REQUEST_SENDED:
                return '→';
            case TransportLogType.REQUEST_RECEIVED:
                return '⇠';
            case TransportLogType.REQUEST_NO_REPLY:
                return '⇥';
            case TransportLogType.REQUEST_EXPIRED:
                return '↚';

            case TransportLogType.RESPONSE_RECEIVED:
                return '←';
            case TransportLogType.RESPONSE_SENDED:
                return '⇢';
            case TransportLogType.RESPONSE_NO_REPLY:
                return '⬎';
            case TransportLogType.RESPONSE_EXPIRED:
                return '↛';
            case TransportLogType.RESPONSE_WAIT:
                return '↺';
            case TransportLogType.RESPONSE_TIMEOUT:
                return '⧖';

            case TransportLogType.EVENT_SENDED:
                return '↦';
            case TransportLogType.EVENT_RECEIVED:
                return '↤';
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    protected commandProcessed<U, V>(command: ITransportCommandAsync<U, V>): void {
        let promise = this.promises.get(command.id);
        if (_.isNil(promise)) {
            return;
        }

        this.promises.delete(command.id);
        if (this.isCommandHasError(command)) {
            promise.handler.reject(command.error);
            this.observer.next(new ObservableData(LoadableEvent.ERROR, command, command.error));
        } else {
            promise.handler.resolve(command.data);
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, command));
        }
        this.observer.next(new ObservableData(LoadableEvent.FINISHED, command));
    }

    protected async commandTimeout<U, V>(command: ITransportCommandAsync<U, V>, options: ITransportCommandOptions): Promise<void> {
        await PromiseHandler.delay(this.getCommandTimeoutDelay(command, options));
        if (!this.promises.has(command.id)) {
            return;
        }
        command.response(new TransportTimeoutError(command));
        this.logCommand(command, TransportLogType.RESPONSE_TIMEOUT);
        this.commandProcessed(command);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected isCommandAsync<U, V = any>(command: ITransportCommand<U>): command is ITransportCommandAsync<U, V> {
        return Transport.isCommandAsync(command);
    }

    protected isCommandHasError<U>(command: ITransportCommand<U>): boolean {
        return Transport.isCommandHasError(command);
    }

    protected getCommandOptions<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): ITransportCommandOptions {
        if (_.isNil(options)) {
            options = {};
        }

        if (_.isNil(options.timeout)) {
            options.timeout = Transport.DEFAULT_TIMEOUT;
        }
        if (_.isNil(options.waitDelay) || !(options.waitDelay in TransportCommandWaitDelay)) {
            options.waitDelay = TransportCommandWaitDelay.NORMAL;
        }
        return options;
    }

    protected getCommandTimeoutDelay<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): number {
        return options.timeout;
    }

    // --------------------------------------------------------------------------
    //
    //  Log Methods
    //
    // --------------------------------------------------------------------------

    protected logListen(name: string): void {
        this.debug(`Start listening "${name}" command`);
    }

    protected logEvent<T>(event: ITransportEvent<T>, type: TransportLogType): void {
        this.debug(this.eventToString(event, type));
        this.verboseData(event.data, type);
    }

    protected logCommand<U>(command: ITransportCommand<U>, type: TransportLogType): void {
        this.debug(this.commandToString(command, type));
        switch (type) {
            case TransportLogType.REQUEST_SENDED:
            case TransportLogType.REQUEST_RECEIVED:
            case TransportLogType.REQUEST_NO_REPLY:
                this.logRequest(command, type);
                break;

            case TransportLogType.RESPONSE_SENDED:
            case TransportLogType.RESPONSE_RECEIVED:
            case TransportLogType.RESPONSE_NO_REPLY:
                this.logResponse(command, type);
                break;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Propeties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LoadableEvent, ITransportCommand<any>>> {
        return this.observer.asObservable();
    }
}

export interface ITransportPromise<U = any, V = any> {
    handler: PromiseHandler<V, ExtendedError>;
    command: ITransportCommandAsync<U, V>;
    options: ITransportCommandOptions;
}

export enum TransportLogType {
    REQUEST_RECEIVED = 'REQUEST_RECEIVED',
    REQUEST_SENDED = 'REQUEST_SENDED',
    REQUEST_NO_REPLY = 'REQUEST_NO_REPLY',
    REQUEST_EXPIRED = 'REQUEST_EXPIRED',

    RESPONSE_RECEIVED = 'RESPONSE_RECEIVE',
    RESPONSE_SENDED = 'RESPONSE_SENDED',
    RESPONSE_NO_REPLY = 'RESPONSE_NO_REPLY',
    RESPONSE_EXPIRED = 'RESPONSE_EXPIRED',

    RESPONSE_WAIT = 'RESPONSE_WAIT',
    RESPONSE_TIMEOUT = 'RESPONSE_TIMEOUT',

    EVENT_SENDED = 'EVENT_SENDED',
    EVENT_RECEIVED = 'EVENT_RECEIVED'
}
