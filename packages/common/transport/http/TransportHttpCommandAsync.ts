import { TransportCommandAsync } from '../../../common/transport';
import { ITransportResponse } from '../ITransportResponse';
import { ITransportHttpRequest } from './ITransportHttpRequest';
import * as _ from 'lodash';

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
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: ITransportHttpRequest<U>): ITransportHttpRequest<U> {
        super.validateRequest(value.data);
        return value;
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
