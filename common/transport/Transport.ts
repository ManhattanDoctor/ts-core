import * as _ from 'lodash';
import { Observable } from 'rxjs';
import * as util from 'util';
import { LoggerWrapper } from '../logger';
import { DateUtil, ObjectUtil } from '../util';
import { ITransport, ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent } from './ITransport';

export abstract class Transport extends LoggerWrapper implements ITransport {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static WAIT_TIMEOUT = 30 * DateUtil.MILISECONDS_SECOND;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
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
        this.verboseData(this.isCommandHasError(command) ? async.error : async.response, type);
    }

    private getLogMark(type: TransportLogType): string {
        switch (type) {
            case TransportLogType.RESPONSE_RECEIVE:
                return '←';
            case TransportLogType.REQUEST_RECEIVE:
                return '⇠';

            case TransportLogType.REQUEST_SEND:
                return '→';
            case TransportLogType.RESPONSE_SEND:
                return '⇢';
            case TransportLogType.RESPONSE_NO_REPLY:
                return '×';
            case TransportLogType.RESPONSE_NO_REPLY:
                return '…';
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

    // --------------------------------------------------------------------------
    //
    //  Log Methods
    //
    // --------------------------------------------------------------------------

    protected logListen(name: string): void {
        this.debug(`Start listening ${name} command`);
    }

    protected logDispatch<T>(event: ITransportEvent<T>): void {
        this.debug(`• ${event.name}`);
    }

    protected logCommand<U>(command: ITransportCommand<U>, type: TransportLogType): void {
        this.debug(this.commandToString(command, type));
        switch (type) {
            case TransportLogType.REQUEST_SEND:
            case TransportLogType.REQUEST_RECEIVE:
                this.logRequest(command, type);
                break;

            case TransportLogType.RESPONSE_SEND:
            case TransportLogType.RESPONSE_RECEIVE:
                this.logResponse(command, type);
                break;
        }
    }
}

export enum TransportLogType {
    RESPONSE_RECEIVE = 'RESPONSE_RECEIVE',
    REQUEST_RECEIVE = 'REQUEST_RECEIVE',
    REQUEST_SEND = 'REQUEST_SEND',
    RESPONSE_SEND = 'RESPONSE_SEND',
    RESPONSE_NO_REPLY = 'RESPONSE_NO_REPLY',
    RESPONSE_WAIT = 'RESPONSE_WAIT'
}
