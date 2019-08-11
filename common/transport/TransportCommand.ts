import { Exclude, Expose } from 'class-transformer';
import * as uuid from 'uuid';
import { ITransportCommand } from './ITransport';

export class TransportCommand<U> implements ITransportCommand<U> {
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
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: U): void {}

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
}
