import { ITransportCommandAsync } from './ITransport';
import { TransportCommandHandler } from './TransportCommandHandler';

export abstract class TransportCommandAsyncHandler<U, V, T extends ITransportCommandAsync<U, V>> extends TransportCommandHandler<U, T> {
    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected abstract async execute(params: U): Promise<V>;
}
