import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ExtendedError } from '../../common/error';
import { ILoggerService } from '../../common/logger';
import { ITransportCommand, ITransportCommandOptions, ITransportEvent } from './ITransport';
import { Transport } from './Transport';

export class LocalTransport extends Transport {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    private listeners: Map<string, Subject<any>>;
    private dispatchers: Map<string, Subject<any>>;

    private promises: Map<string, IPromise>;
    private pendingCommands: Map<string, Array<ITransportCommand<any, any>>>;

    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor(logger: ILoggerService, context?: string) {
        super(logger, context);

        this.promises = new Map();
        this.pendingCommands = new Map();

        this.listeners = new Map();
        this.dispatchers = new Map();
    }

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------

    public send<U, V>(command: ITransportCommand<U, V>): void {
        let name = command.name;
        let listener = this.listeners.get(name);
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
    }

    public sendListen<U, V>(command: ITransportCommand<U, V>, options?: ITransportCommandOptions): Promise<V> {
        return new Promise<V>((resolve, reject) => {
            this.promises.set(command.id, { resolve, reject });
            this.send(command);
        });
    }

    public wait<U, V>(command: ITransportCommand<U, V>): void {
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public listen<U>(name: string): Observable<U> {
        if (this.listeners.has(name)) {
            throw new ExtendedError(`Command "${name}" already listening`);
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
        this.debug(`Start listening "${name}" command`);
        return item.asObservable();
    }

    public response<U, V>(command: ITransportCommand<U, V>, result?: V | ExtendedError | Error | void): void {
        try {
            command.response(result);
        } catch (error) {
            command.response(error);
        }

        let promise = this.promises.get(command.id);
        if (_.isNil(promise)) {
            return;
        }

        if (!_.isNil(command.error)) {
            promise.reject(command.error);
        } else {
            promise.resolve(command.data);
        }
        this.promises.delete(command.id);
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

    //--------------------------------------------------------------------------
    //
    //  Private Properties
    //
    //--------------------------------------------------------------------------

    protected get validatorOptions(): ValidatorOptions {
        return { validationError: { target: false } };
    }
}

export interface IPromise {
    readonly resolve: (result?: any) => void;
    readonly reject: (error?: Error | string) => void;
}
