import { ITransportCommandAsync } from './ITransport';
import { TransportCommandHandler } from './TransportCommandHandler';

export abstract class TransportCommandAsyncHandler<U, V, T extends ITransportCommandAsync<U, V>> extends TransportCommandHandler<U, T> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected abstract async execute(params: U): Promise<V>;

    protected checkResponse(params: V): V {
        return params;
    }
}
