import { Observable } from 'rxjs';
import { ExtendedError } from '../error';

export interface ITransport {
    send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void;
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
    timeout?: number;
    waitDelay?: TransportCommandWaitDelay;
    waitMaxCount?: number;
}

export enum TransportCommandWaitDelay {
    EXTRA_SLOW = 30000,
    SUPER_SLOW = 10000,
    SLOW = 5000,
    NORMAL = 3000,
    FAST = 1000,
    SUPER_FAST = 500,
    EXTRA_FAST = 100
}

export interface ITransportEvent<T> {
    readonly name: string;
    readonly data?: T;
}
