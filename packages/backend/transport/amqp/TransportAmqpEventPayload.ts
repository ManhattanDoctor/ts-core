import { ITransportEvent, TransportEvent } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error';
import { TransformUtil } from '@ts-core/common/util';
import { Message } from 'amqplib';
import * as _ from 'lodash';

export class TransportAmqpEventPayload<U = any> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static parse<U>(message: Message): ITransportEvent<U> {
        let data = null;
        let content: string = null;
        try {
            content = message.content.toString();
            data = TransformUtil.toJSON(content);
        } catch (error) {
            throw new TransportInvalidDataError(`Invalid payload: ${error.message}`, content);
        }

        let payload = TransformUtil.toClass(TransportAmqpEventPayload, data);
        if (_.isNil(payload.name)) {
            throw new TransportInvalidDataError(`Invalid payload: name is nil`, content);
        }

        return new TransportEvent(payload.name, payload.data) as any;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public name: string;
    public data: U;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(event?: ITransportEvent<U>) {
        if (_.isNil(event)) {
            return;
        }
        this.name = event.name;
        this.data = event.data;
    }
}
