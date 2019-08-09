import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import * as util from 'util';
import { ExtendedError } from '../error';
import { ILogger } from '../logger';
import { ObjectUtil } from '../util';
import { ITransportAsyncCommand, ITransportCommand, ITransportCommandOptions, ITransportEvent } from './ITransport';
import { Transport } from './Transport';

export class LocalTransport extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private listeners: Map<string, Subject<any>>;
    private dispatchers: Map<string, Subject<any>>;

    private promises: Map<string, IPromise>;
    private pendingCommands: Map<string, Array<ITransportCommand<any>>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, context?: string) {
        super(logger, context);

        this.promises = new Map();
        this.pendingCommands = new Map();

        this.listeners = new Map();
        this.dispatchers = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>): void {
        let name = command.name;
        let listener = this.listeners.get(name);
        this.debug(`→ ${name} (${command.id})`);
        if (!_.isNil(command.request)) {
            this.verbose(`→ ${util.inspect(command.request, { showHidden: false, depth: null })}`);
        }

        if (!_.isNil(listener)) {
            let timeout = setTimeout(() => {
                listener.next(command);
                clearTimeout(timeout);
            });
            return;
        }

        if (!this.pendingCommands.has(name)) {
            this.pendingCommands.set(name, []);
        }
        this.pendingCommands.get(name).push(command);
        this.verbose(`No listener for command ${command.name}: added to pending list`);
    }

    public sendListen<U, V>(command: ITransportAsyncCommand<U, V>, options?: ITransportCommandOptions): Promise<V> {
        return new Promise<V>((resolve, reject) => {
            this.promises.set(command.id, { resolve, reject });
            this.send(command);
        });
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | ExtendedError | Error): void {
        if (!ObjectUtil.instanceOf(command, ['response'])) {
            return;
        }

        let name = command.name;
        let async = command as ITransportAsyncCommand<any, any>;

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

    public wait<U, V>(command: ITransportCommand<U>): void {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public listen<U>(name: string): Observable<U> {
        if (this.listeners.has(name)) {
            throw new ExtendedError(`Command ${name} already listening`);
        }
        let item = new Subject<U>();
        this.listeners.set(name, item);

        let commands = this.pendingCommands.get(name);
        if (!_.isEmpty(commands)) {
            let timeout = setTimeout(() => {
                _.forEach(commands, command => this.send(command));
                clearTimeout(timeout);
            });
        }
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

export interface IPromise {
    readonly resolve: (result?: any) => void;
    readonly reject: (error?: Error | string) => void;
}
