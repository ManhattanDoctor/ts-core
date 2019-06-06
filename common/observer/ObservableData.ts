import { ExtendedError } from '../error/ExtendedError';

export class ObservableData<U, V> {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    protected _type: U;
    protected _data: V;
    protected _error: ExtendedError;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(type: U, data?: V, error?: Error | ExtendedError) {
        this._type = type;
        this._data = data;
        this._error = error instanceof ExtendedError ? error : ExtendedError.create(error);
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get type(): U {
        return this._type;
    }

    public get data(): V {
        return this._data;
    }

    public get error(): Error {
        return this._error;
    }
}
