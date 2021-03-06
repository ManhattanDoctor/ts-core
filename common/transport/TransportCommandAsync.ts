import { Exclude, Expose } from 'class-transformer';
import { ExtendedError } from '../error';
import { ObjectUtil } from '../util';
import { ITransportCommandAsync } from './ITransport';
import { TransportCommand } from './TransportCommand';

export class TransportCommandAsync<U, V> extends TransportCommand<U> implements ITransportCommandAsync<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    protected _data: V;
    @Exclude()
    protected _error: ExtendedError;

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

    protected validateResponse(value: V): void {}

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    @Expose()
    public get data(): V {
        return this._data;
    }

    @Expose()
    public get error(): ExtendedError {
        return this._error;
    }
}
