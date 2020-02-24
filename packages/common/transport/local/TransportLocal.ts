import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ExtendedError } from '../../error';
import { LoadableEvent } from '../../Loadable';
import { ILogger } from '../../logger';
import { ObservableData } from '../../observer';
import { PromiseHandler } from '../../promise';
import { TransportTimeoutError } from '../error';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent } from '../ITransport';
import { Transport, TransportLogType } from '../Transport';

export class TransportLocal extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private listeners: Map<string, Subject<any>>;
    private dispatchers: Map<string, Subject<any>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);
        this.listeners = new Map();
        this.dispatchers = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>): void {
        this.requestSend(command);
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        let promise = this.promises.get(command.id);
        if (promise) {
            return promise.promise;
        }

        promise = PromiseHandler.create();
        this.promises.set(command.id, promise);
        this.requestSend(command, options);
        return promise.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        if (!this.isCommandAsync(command)) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            return;
        }

        let async = command as ITransportCommandAsync<U, any>;
        async.response(result);
        this.responseSend(async);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        this.logCommand(command, TransportLogType.RESPONSE_WAIT);
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public listen<U>(name: string): Observable<U> {
        if (this.listeners.has(name)) {
            throw new ExtendedError(`Command "${name}" already listening`);
        }
        let item = new Subject<U>();
        this.listeners.set(name, item);

        this.logListen(name);
        return item.asObservable();
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        let item = this.dispatchers.get(name);
        if (_.isNil(item)) {
            return;
        }
        this.logDispatch(event);
        item.next(event);
    }

    public getDispatcher<T>(name: string): Observable<T> {
        let item = this.dispatchers.get(name);
        if (_.isNil(item)) {
            let item = new Subject<T>();
            this.dispatchers.set(name, item);
        }
        return item.asObservable();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async requestSend<U, V>(command: ITransportCommand<U>, options?: ITransportCommandOptions): Promise<void> {
        this.logCommand(command, TransportLogType.REQUEST_SENDED);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, command.request));

        // Immediately receive the same command
        this.requestReceived(command);
        if (!this.isCommandAsync(command)) {
            return;
        }

        this.options.set(command.id, options);
        await PromiseHandler.delay(this.getCommandTimeout(command, options));
        if (this.promises.has(command.id)) {
            this.complete(command, new TransportTimeoutError(command));
        }
    }

    private requestReceived<U>(command: ITransportCommand<U>): void {
        this.logCommand(command, TransportLogType.REQUEST_RECEIVED);

        let listener = this.listeners.get(command.name);
        if (_.isNil(listener)) {
            this.complete(command, new ExtendedError(`No listener for "${command.name}" command`));
            return;
        }
        listener.next(command);
    }

    private responseSend<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_SENDED);
        // Immediately receive the commad
        this.responseReceived(command);
    }

    private responseReceived<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);

        let promise = this.promises.get(command.id);
        if (_.isNil(promise)) {
            return;
        }

        this.options.delete(command.id);
        this.promises.delete(command.id);
        if (this.isCommandHasError(command)) {
            promise.reject(command.error);
            this.observer.next(new ObservableData(LoadableEvent.ERROR, command, command.error));
        } else {
            promise.resolve(command.data);
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, command));
        }
        this.observer.next(new ObservableData(LoadableEvent.FINISHED, command));
    }
}
