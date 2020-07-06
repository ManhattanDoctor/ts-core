import { ExtendedError } from '../error';
import { TransformUtil } from '../util';
import { ITransportCommandAsync } from './ITransport';
import { ITransportResponse } from './ITransportResponse';
import { TransportCommand } from './TransportCommand';
import { IsOptional } from 'class-validator';
import { ValidateUtil } from '../util';

export class TransportCommandAsync<U, V> extends TransportCommand<U> implements ITransportResponse<V>, ITransportCommandAsync<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsOptional()
    public data: V;

    @IsOptional()
    public error: ExtendedError;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public response(value: V | ExtendedError | Error): void {
        try {
            this.data = this.validateResponse(value);
            this.error = null;
        } catch (error) {
            this.data = null;
            this.error = error;
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

        value = this.checkResponse(value);
        ValidateUtil.validate(value);
        return value;
    }

    protected checkResponse(value: V): V {
        return value;
    }
}
