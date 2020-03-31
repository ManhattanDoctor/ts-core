import { ExtendedError } from '@ts-core/common/error';
import { ITransportCommandAsync, ITransportCommand, Transport } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error/TransportInvalidDataError';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { IsOptional, IsString } from 'class-validator';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Interface
//
// --------------------------------------------------------------------------

export interface ITransportFabricResponsePayload<V> {
    id: string;
    response?: ExtendedError | V;
}

// --------------------------------------------------------------------------
//
//  Class
//
// --------------------------------------------------------------------------

export class TransportFabricResponsePayload<U = any, V = any> implements ITransportFabricResponsePayload<V> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static parse<U, V>(buffer: Buffer): TransportFabricResponsePayload<U, V> {
        let payload: TransportFabricResponsePayload<U, V> = null;
        try {
            payload = TransformUtil.toClassBuffer<TransportFabricResponsePayload<U, V>>(TransportFabricResponsePayload, buffer);
        } catch (error) {
            throw new TransportInvalidDataError(`Invalid payload: ${error.message}`, buffer.toString(TransformUtil.ENCODING));
        }
        ValidateUtil.validate(payload);
        return payload;
    }

    public static fromError(id: string, error: ExtendedError): TransportFabricResponsePayload {
        let payload = new TransportFabricResponsePayload();
        payload.id = id;
        payload.response = error;
        return payload;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public id: string;

    @IsOptional()
    public response: ExtendedError | V;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(command?: ITransportCommand<U>) {
        if (_.isNil(command)) {
            return;
        }
        this.id = command.id;
        if (Transport.isCommandAsync(command)) {
            this.response = _.isNil(command.error) ? command.data : command.error;
        }
    }
}
