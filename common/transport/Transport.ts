import { Observable } from 'rxjs';
import { ExtendedError } from '../error';
import { LoggerWrapper } from '../logger';
import { ITransport, ITransportCommandAsync, ITransportCommand, ITransportCommandOptions, ITransportEvent } from './ITransport';
import { ObjectUtil } from '../util';

export abstract class Transport extends LoggerWrapper implements ITransport {
    
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract send<U>(command: ITransportCommand<U>): void;
    public abstract sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V>;

    public abstract wait<U>(command: ITransportCommand<U>): void;
    public abstract listen<U>(name: string): Observable<U>;
    public abstract complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError): void;

    public abstract dispatch<T>(event: ITransportEvent<T>): void;
    public abstract getDispatcher<T>(name: string): Observable<T>;


    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected isCommandAsync<U>(command: ITransportCommand<U>): boolean {
        return ObjectUtil.instanceOf(command, ['response']);
    }
}
