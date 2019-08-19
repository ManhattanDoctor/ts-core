import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import * as util from 'util';
import { ExtendedError } from '../error';
import { ILogger } from '../logger';
import { PromiseHandler } from '../promise';
import { ObjectUtil } from '../util';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent } from './ITransport';
import { Transport } from './Transport';

export class TransportLocal extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private listeners: Map<string, Subject<any>>;
    private dispatchers: Map<string, Subject<any>>;

    private promises: Map<string, PromiseHandler>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);

        this.promises = new Map();

        this.listeners = new Map();
        this.dispatchers = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private isCommandAsync<U>(command: ITransportCommand<U>): boolean {
        return ObjectUtil.instanceOf(command, ['response']);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>): void {
        let name = command.name;
        let listener = this.listeners.get(name);

        if (this.isCommandAsync(command)) {
            this.debug(`→ ${name} (${command.id})`);
        } else {
            this.debug(`↮ ${name}`);
        }

        if (!_.isNil(command.request)) {
            this.verbose(`→ ${util.inspect(command.request, { showHidden: false, depth: null })}`);
        }

        if (_.isNil(listener)) {
            throw new ExtendedError(`No listener for command ${command.name}`);
        }
        listener.next(command);
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        let item = this.promises.get(command.id);
        if (!item) {
            item = PromiseHandler.create();
            this.promises.set(command.id, item);
            this.send(command);
        }
        return item.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError | Error): void {
        if (!this.isCommandAsync(command)) {
            return;
        }

        let name = command.name;
        let async = command as ITransportCommandAsync<any, any>;

        this.debug(`← ${name} (${command.id})`);
        this.verbose(`← ${!_.isNil(result) ? util.inspect(result, { showHidden: false, depth: null }) : 'Nil'}`);

        async.response(result);
        let promise = this.promises.get(command.id);
        if (_.isNil(promise)) {
            return;
        }

        if (!_.isNil(async.error)) {
            promise.reject(async.error);
        } else {
            promise.resolve(async.data);
        }
        this.promises.delete(async.id);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public listen<U>(name: string): Observable<U> {
        if (this.listeners.has(name)) {
            throw new ExtendedError(`Command ${name} already listening`);
        }
        let item = new Subject<U>();
        this.listeners.set(name, item);

        this.debug(`Start listening ${name} command`);
        return item.asObservable();
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        let item = this.dispatchers.get(name);
        if (_.isNil(item)) {
            return;
        }
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
