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
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: ITransportHttpRequest<T>): ITransportHttpRequest<T> {
        return super.validateRequest(value.data);
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
