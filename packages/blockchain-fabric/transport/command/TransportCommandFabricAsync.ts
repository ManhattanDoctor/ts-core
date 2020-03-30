import { ExtendedError } from '@ts-core/common/error';
import { TransportCommandAsync } from '@ts-core/common/transport';
import { ITransportFabricStub } from '../stub';
import { ITransportCommandFabricAsync } from '../TransportFabric';

export class TransportCommandFabricAsync<U, V> extends TransportCommandAsync<U, V> implements ITransportCommandFabricAsync<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get stub(): ITransportFabricStub {
        throw new ExtendedError(`Can't get access to stun directly from command`);
    }
}
