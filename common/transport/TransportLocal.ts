import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ExtendedError } from '../error';
import { ILogger } from '../logger';
import { PromiseHandler } from '../promise';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent } from './ITransport';
import { Transport, TransportLogType } from './Transport';
import { TransportTimeoutError } from './TransportTimeoutError';

export class TransportLocal extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private options: Map<string, ITransportCommandOptions>;
    private listeners: Map<string, Subject<any>>;
    private dispatchers: Map<string, Subject<any>>;

    private promises: Map<string, PromiseHandler<any, ExtendedError>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);

        this.options = new Map();
        this.promises = new Map();
        this.listeners = new Map();
        this.dispatchers = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void {
        this.options.set(command.id, options);
        this.logCommand(command, TransportLogType.REQUEST_SEND);

        let listener = this.listeners.get(command.name);
        if (!_.isNil(listener)) {
            listener.next(command);
        }
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        let item = this.promises.get(command.id);
        if (item) {
            return item.promise;
        }
        
        item = PromiseHandler.create();
        this.promises.set(command.id, item);
        this.send(command, options);

        let timeout = Transport.WAIT_TIMEOUT;
        if (!_.isNil(options) && _.isNumber(options.waitTimeout)) {
            timeout = options.waitTimeout;
        }
        PromiseHandler.delay(timeout).then(() => {
            item.reject(new TransportTimeoutError(command));
            this.promises.delete(command.id);
        });
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        this.options.delete(command.id);

        if (!this.isCommandAsync(command)) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            return;
        }

        let async = command as ITransportCommandAsync<U, any>;
        async.response(result);
        this.logCommand(command, TransportLogType.RESPONSE_SEND);

        let promise = this.promises.get(command.id);
        if (_.isNil(promise)) {
            return;
        }

        if (this.isCommandHasError(command)) {
            promise.reject(async.error);
        } else {
            promise.resolve(async.data);
        }
        this.promises.delete(command.id);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        this.logCommand(command, TransportLogType.RESPONSE_WAIT);
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public listen<U>(name: string): Observable<U> {
        if (this.listeners.has(name)) {
            throw new ExtendedError(`Command ${name} already listening`);
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
}
