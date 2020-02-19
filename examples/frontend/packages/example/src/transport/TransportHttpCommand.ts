import { ExtendedError } from '@ts-core/common/error';
import { TransportCommand } from '@ts-core/common/transport';
import * as _ from 'lodash';
import { ITransportHttpRequest } from './ITransportHttpRequest';

export class TransportHttpCommand<T> extends TransportCommand<ITransportHttpRequest<T>> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ITransportHttpRequest<T>) {
        super(request.name, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: ITransportHttpRequest<T>): void {
        if (_.isNil(value.name)) {
            throw new ExtendedError(`Command name is Nil`);
        }
        value.url = value.name;
    }
}
