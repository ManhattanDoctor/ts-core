import { Exclude, Expose } from 'class-transformer';
import { ExtendedError } from '../error';
import { TransformUtil } from '../util';
import { ITransportCommandAsync } from './ITransport';
import { ITransportResponse } from './ITransportResponse';
import { TransportCommand } from './TransportCommand';

export class TransportCommandAsync<U, V> extends TransportCommand<U> implements ITransportResponse<V>, ITransportCommandAsync<U, V> {
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
        try {
            this._data = this.validateResponse(value);
            this._error = null;
        } catch (error) {
            this._data = null;
            this._error = error;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateResponse(value: V | ExtendedError | Error): V {
        if (value instanceof ExtendedError) {
            throw value;
        }
        if (ExtendedError.instanceOf(value)) {
            throw TransformUtil.toClass(ExtendedError, value);
        }
        if (value instanceof Error) {
            throw ExtendedError.create(value);
        }
        return value;
    }

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
