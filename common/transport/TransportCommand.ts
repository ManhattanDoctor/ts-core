import { Exclude, Expose } from 'class-transformer';
import * as uuid from 'uuid';
import { ExtendedError } from '../error';
import { ObjectUtil } from '../util';
import { ITransportAsyncCommand } from './ITransport';

export class TransportCommand<U, V> implements ITransportAsyncCommand<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    protected _id: string;
    @Exclude()
    protected _name: string;
    @Exclude()
    protected _request: U;

    @Exclude()
    protected _data: V;
    @Exclude()
    protected _error: ExtendedError;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, request?: U, id?: string) {
        this._name = name;
        this._id = id || uuid();

        if (!request) {
            request = {} as any;
        }

        this.validateRequest(request);
        this._request = request;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public response(value: V | ExtendedError | Error): void {
        if (value instanceof ExtendedError || ObjectUtil.hasOwnProperties(value, ['code', 'message', 'details'])) {
            this._error = value as ExtendedError;
            return;
        }

        if (value instanceof Error) {
            this._error = ExtendedError.create(value);
            return;
        }

        try {
            this.validateResponse(value);
            this._error = null;
            this._data = value;
        } catch (error) {
            this._error = ExtendedError.create(error);
            this._data = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: U): void {}

    protected validateResponse(value: V): void {}

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    @Expose()
    public get id(): string {
        return this._id;
    }

    @Expose()
    public get name(): string {
        return this._name;
    }

    @Expose()
    public get request(): U {
        return this._request;
    }

    @Expose()
    public get data(): V {
        return this._data;
    }

    @Expose()
    public get error(): ExtendedError {
        return this._error;
    }
}
