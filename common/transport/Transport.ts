import { Observable } from 'rxjs';
import { ExtendedError } from '../error';
import { LoggerWrapper } from '../logger';
import { ITransport, ITransportAsyncCommand, ITransportCommand, ITransportCommandOptions, ITransportEvent } from './ITransport';

export abstract class Transport extends LoggerWrapper implements ITransport {
    public abstract send<U>(command: ITransportCommand<U>): void;
    public abstract sendListen<U, V>(command: ITransportAsyncCommand<U, V>, options?: ITransportCommandOptions): Promise<V>;

    public abstract wait<U>(command: ITransportCommand<U>): void;
    public abstract listen<U>(name: string): Observable<U>;
    public abstract complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError): void;

    public abstract dispatch<T>(event: ITransportEvent<T>): void;
    public abstract getDispatcher<T>(name: string): Observable<T>;
}
