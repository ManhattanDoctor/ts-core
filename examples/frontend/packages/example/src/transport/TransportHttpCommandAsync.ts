import { ExtendedError } from '@ts-core/common/error';
import { TransportCommandAsync } from '@ts-core/common/transport';
import * as _ from 'lodash';
import { ITransportHttpRequest } from './ITransportHttpRequest';
import { TransportHttpResponse } from './TransportHttpResponse';

export class TransportHttpCommandAsync<U, V> extends TransportCommandAsync<ITransportHttpRequest<U>, TransportHttpResponse<U, V>> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ITransportHttpRequest<U>) {
        super(request.name, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: ITransportHttpRequest<U>): void {
        if (_.isNil(value.name)) {
            throw new ExtendedError(`Command name is Nil`);
        }
        value.url = value.name;
    }
}
