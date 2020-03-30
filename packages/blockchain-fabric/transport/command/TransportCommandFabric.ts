import { ExtendedError } from '@ts-core/common/error';
import { TransportCommand } from '@ts-core/common/transport';
import { ITransportFabricStub } from '../stub';
import { ITransportCommandFabric } from '../TransportFabric';

export class TransportCommandFabric<T> extends TransportCommand<T> implements ITransportCommandFabric<T> {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get stub(): ITransportFabricStub {
        throw new ExtendedError(`Can't get access to stun directly from command`);
    }
}
