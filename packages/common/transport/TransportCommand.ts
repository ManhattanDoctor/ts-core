import { Exclude, Expose } from 'class-transformer';
import * as uuid from 'uuid';
import { ITransportCommand } from './ITransport';
import { ITransportRequest } from './ITransportRequest';

export class TransportCommand<T extends ITransportRequest> implements ITransportCommand<T> {
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
    protected _request: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, request?: T, id?: string) {
        this._name = name;
        this._id = id || uuid();
        this._request = this.validateRequest(request || ({} as any));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: T): T {
        return value;
    }

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
    public get request(): T {
        return this._request;
    }

    @Expose()
    public get isHandleError(): boolean {
        return this.request ? this.request.isHandleError : false;
    }

    @Expose()
    public get isHandleLoading(): boolean {
        return this.request ? this.request.isHandleLoading : false;
    }
}
