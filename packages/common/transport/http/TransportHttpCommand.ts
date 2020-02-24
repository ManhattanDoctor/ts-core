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
}
