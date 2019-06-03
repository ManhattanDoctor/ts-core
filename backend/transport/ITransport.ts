import { Observable } from 'rxjs/internal/Observable';
import { ExtendedError } from '../../common/error/ExtendedError';

export interface ITransport {
    send<U, V>(command: ITransportCommand<U, V>): void;
    sendListen<U, V>(command: ITransportCommand<U, V>, options?: ITransportCommandOptions): Promise<V>;

    wait<U, V>(command: ITransportCommand<U, V>): void;
    listen<U>(name: string): Observable<U>;
    response<U, V>(command: ITransportCommand<U, V>, result?: V | ExtendedError | Error | void): void;

    dispatch<T>(event: ITransportEvent<T>): void;
    getDispatcher<T>(name: string): Observable<T>;
}

export interface ITransportCommand<U, V> {
    readonly id: string;
    readonly name: string;
    readonly request?: U;

    readonly data: V;
    readonly error?: ExtendedError;
    response(value: V | ExtendedError | Error | void): void;
}

export interface ITransportCommandOptions {
    waitTimeout?: number;
    repeatCount?: number;
}

export interface ITransportEvent<T> {
    readonly name: string;
    readonly data?: T;
}
