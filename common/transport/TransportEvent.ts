import * as _ from 'lodash';
import { ExtendedError } from '../error';
import { ITransportEvent } from './ITransport';

export class TransportEvent<T> implements ITransportEvent<T> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _name: string;
    protected _data: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, data?: T) {
        this._name = name;

        if (_.isNil(data)) {
            return;
        }
        this.validateData(data);
        this._data = data;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateData(value: T): void {
        if (_.isNil(value)) {
            throw new ExtendedError('Unable to validate event: data is undefined');
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get name(): string {
        return this._name;
    }

    public get data(): T {
        return this._data;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(): ITransportEvent<T> {
        return { name: this.name, data: this.data };
    }
}
