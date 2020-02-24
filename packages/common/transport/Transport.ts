import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import * as util from 'util';
import { ExtendedError } from '../error';
import { LoadableEvent } from '../Loadable';
import { ILogger, LoggerWrapper } from '../logger';
import { ObservableData } from '../observer';
import { PromiseHandler } from '../promise';
import { DateUtil, ObjectUtil } from '../util';
import { ITransport, ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent } from './ITransport';
import { ITransportRequest } from './ITransportRequest';
import { ITransportResponse } from './ITransportResponse';

export abstract class Transport extends LoggerWrapper implements ITransport {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static WAIT_TIMEOUT = 30 * DateUtil.MILISECONDS_SECOND;

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected options: Map<string, ITransportCommandOptions>;
    protected promises: Map<string, PromiseHandler<any, ExtendedError>>;
    protected observer: Subject<ObservableData<LoadableEvent, ITransportRequest | ITransportResponse>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);

        this.options = new Map();
        this.promises = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Abstract Methods
    //
    // --------------------------------------------------------------------------

    public abstract send<U>(command: ITransportCommand<U>): void;
    public abstract sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V>;

    public abstract wait<U>(command: ITransportCommand<U>): void;
    public abstract listen<U>(name: string): Observable<U>;
    public abstract complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void;

    public abstract dispatch<T>(event: ITransportEvent<T>): void;
    public abstract getDispatcher<T>(name: string): Observable<T>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }

        this.options.clear();
        this.options = null;

        this.promises.clear();
        this.promises = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private commandToString<U>(command: ITransportCommand<U>, type: TransportLogType): string {
        return `${this.getLogMark(type)} ${command.name} ${!this.isCommandHasError(command) ? '✔' : '✘'} (${command.id})`;
    }

    private verboseData<U>(data: U, type: TransportLogType): void {
        if (!_.isNil(data)) {
            this.verbose(`${this.getLogMark(type)} ${util.inspect(data, { showHidden: false, depth: null })}`);
        }
    }

    private logRequest<U>(command: ITransportCommand<U>, type: TransportLogType): void {
        if (!_.isNil(command)) {
            this.verboseData(command.request, type);
        }
    }
    private logResponse<U, V>(command: ITransportCommand<U>, type: TransportLogType): void {
        if (_.isNil(command)) {
            return;
        }
        let async = command as ITransportCommandAsync<U, any>;
        this.verboseData(this.isCommandHasError(command) ? async.error : async.data, type);
    }

    private getLogMark(type: TransportLogType): string {
        switch (type) {
            case TransportLogType.RESPONSE_RECEIVED:
                return '←';
            case TransportLogType.REQUEST_RECEIVED:
                return '⇠';
            case TransportLogType.REQUEST_NO_REPLY:
                return '↮';

            case TransportLogType.REQUEST_SENDED:
                return '→';
            case TransportLogType.RESPONSE_SENDED:
                return '⇢';
            case TransportLogType.RESPONSE_NO_REPLY:
                return '×';
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected isCommandAsync<U>(command: ITransportCommand<U>): boolean {
        return ObjectUtil.instanceOf(command, ['response']);
    }

    protected isCommandHasError<U>(command: ITransportCommand<U>): boolean {
        return this.isCommandAsync(command) && !_.isNil((command as any).error);
    }

    protected getCommandTimeout<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): number {
        return !_.isNil(options) && _.isNumber(options.waitTimeout) ? options.waitTimeout : Transport.WAIT_TIMEOUT;
    }

    // --------------------------------------------------------------------------
    //
    //  Log Methods
    //
    // --------------------------------------------------------------------------

    protected logListen(name: string): void {
        this.debug(`Start listening "${name}" command`);
    }

    protected logDispatch<T>(event: ITransportEvent<T>): void {
        this.debug(`• ${event.name}`);
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

    public get events(): Observable<ObservableData<LoadableEvent, ITransportRequest | ITransportResponse>> {
        return this.observer.asObservable();
    }
}

export enum TransportLogType {
    REQUEST_RECEIVED = 'REQUEST_RECEIVED',
    REQUEST_SENDED = 'REQUEST_SENDED',
    REQUEST_NO_REPLY = 'REQUEST_NO_REPLY',

    RESPONSE_RECEIVED = 'RESPONSE_RECEIVE',
    RESPONSE_SENDED = 'RESPONSE_SEND',
    RESPONSE_NO_REPLY = 'RESPONSE_NO_REPLY',

    RESPONSE_WAIT = 'RESPONSE_WAIT'
}
