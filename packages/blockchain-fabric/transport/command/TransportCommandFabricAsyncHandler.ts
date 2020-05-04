import { ITransportCommandFabricAsync } from '../TransportFabric';
import { TransportCommandFabricHandler } from './TransportCommandFabricHandler';

export abstract class TransportCommandFabricAsyncHandler<U, V, T extends ITransportCommandFabricAsync<U, V>> extends TransportCommandFabricHandler<U, T> {
    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected abstract async execute(request: U, command: T, ...params): Promise<V>;

    protected checkResponse(params: V): V {
        return params;
    }
}
