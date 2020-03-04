import { TransportCommand } from '../../../common/transport';
import { ITransportHttpRequest } from './ITransportHttpRequest';

export class TransportHttpCommand<T> extends TransportCommand<ITransportHttpRequest<T>> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(path: string, request?: ITransportHttpRequest<T>) {
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
