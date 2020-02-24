import * as _ from 'lodash';
import { ExtendedError } from '../error';

export class ObservableData<U, V, E = any> {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected _type: U;
    protected _data: V;
    protected _error: ExtendedError<E>;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(type: U, data?: V, error?: Error | ExtendedError<E>) {
        this._type = type;
        this._data = data;
        if (!_.isNil(error)) {
            this._error = ExtendedError.create(error);
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get type(): U {
        return this._type;
    }

    public get data(): V {
        return this._data;
    }

    public get error(): ExtendedError<E> {
        return this._error;
    }
}
