import { TransportCommandFabricHandler } from './TransportCommandFabricHandler';
import { ITransportCommandAsync } from '@ts-core/common/transport';

export abstract class TransportCommandFabricAsyncHandler<U, V, T extends ITransportCommandAsync<U, V>> extends TransportCommandFabricHandler<U, T> {
    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected abstract async execute(request: U, ...params): Promise<V>;

    protected checkResponse(params: V): V {
        return params;
    }
}
