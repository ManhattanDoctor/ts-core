import { ExtendedError } from '@ts-core/common/error';
import { ITransportCommandAsync } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error/TransportInvalidDataError';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { Message } from 'amqplib';
import { IsOptional, IsString } from 'class-validator';
import * as _ from 'lodash';
import { ITransportAmqpResponsePayload } from './ITransportAmqpResponsePayload';

export class TransportAmqpResponsePayload<U = any, V = any> implements ITransportAmqpResponsePayload<V> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static parse<U, V>(message: Message): TransportAmqpResponsePayload<U, V> {
        let data = null;
        let content: string = null;
        try {
            content = message.content.toString('utf-8');
            data = TransformUtil.toJSON(content);
        } catch (error) {
            throw new TransportInvalidDataError(`Invalid payload: ${error.message}`, content);
        }

        let payload = TransformUtil.toClass<TransportAmqpResponsePayload<U, V>>(TransportAmqpResponsePayload, data);
        ValidateUtil.validate(payload);
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
    public response?: ExtendedError | V;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(command?: ITransportCommandAsync<U, V>) {
        if (_.isNil(command)) {
            return;
        }
        this.id = command.id;
        this.response = _.isNil(command.error) ? command.data : command.error;
    }
}
