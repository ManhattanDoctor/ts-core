import { TransportCommandAsync } from '../../../common/transport';
import { ITransportResponse } from '../ITransportResponse';
import { ITransportHttpRequest } from './ITransportHttpRequest';

// V is first for convenience
export class TransportHttpCommandAsync<V, U = any> extends TransportCommandAsync<ITransportHttpRequest<U>, V> implements ITransportResponse<V> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(path: string, request?: ITransportHttpRequest<U>) {
        super(path, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isHandleError(): boolean {
        return this.request ? this.request.isHandleError : false;
    }

    public get isHandleLoading(): boolean {
        return this.request ? this.request.isHandleLoading : false;
    }
}
