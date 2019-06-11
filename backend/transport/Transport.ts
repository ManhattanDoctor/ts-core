import { Observable } from 'rxjs';
import { ExtendedError } from '../../common/error';
import { LoggerWrapper } from '../../common/logger';
import { ITransport, ITransportCommand, ITransportCommandOptions, ITransportEvent } from './ITransport';

export abstract class Transport extends LoggerWrapper implements ITransport {
    public abstract send<U, V>(command: ITransportCommand<U, V>): void;
    public abstract sendListen<U, V>(command: ITransportCommand<U, V>, options?: ITransportCommandOptions): Promise<V>;

    public abstract wait<U, V>(command: ITransportCommand<U, V>): void;
    public abstract listen<U>(name: string): Observable<U>;
    public abstract response<U, V>(command: ITransportCommand<U, V>, result?: V | ExtendedError | Error | void): void;

    public abstract dispatch<T>(event: ITransportEvent<T>): void;
    public abstract getDispatcher<T>(name: string): Observable<T>;
}
