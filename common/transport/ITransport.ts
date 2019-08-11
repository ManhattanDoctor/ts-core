import { Observable } from 'rxjs';
import { ExtendedError } from '../error';

export interface ITransport {
    send<U>(command: ITransportCommand<U>): void;
    sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V>;

    wait<U>(command: ITransportCommand<U>): void;
    listen<U>(name: string): Observable<U>;
    complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError): void;

    dispatch<T>(event: ITransportEvent<T>): void;
    getDispatcher<T>(name: string): Observable<T>;
}

export interface ITransportCommand<U> {
    readonly id: string;
    readonly name: string;
    readonly request?: U;
}

export interface ITransportCommandAsync<U, V> extends ITransportCommand<U> {
    readonly data: V;
    readonly error?: ExtendedError;
    response(value: V | ExtendedError | Error): void;
}

export interface ITransportCommandOptions {
    waitTimeout?: number;
    repeatCount?: number;
}

export interface ITransportEvent<T> {
    readonly name: string;
    readonly data?: T;
}
