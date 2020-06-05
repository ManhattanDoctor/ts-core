import { TransportHttpCommand, ITransportHttpRequest } from '@ts-core/common/transport/http';
import { ObjectUtil } from '@ts-core/common/util';

export class TransportHttpRpcCommand<T> extends TransportHttpCommand<T> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(method: string, request?: T | ITransportHttpRequest<T>) {
        super(method, ObjectUtil.hasOwnProperty(request, 'data') ? (request as ITransportHttpRequest) : { data: request });
    }
}
