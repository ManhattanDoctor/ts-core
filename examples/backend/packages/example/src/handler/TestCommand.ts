import { TransportCommandFabric } from '@ts-core/blockchain-fabric/transport/command';

export class TestCommand extends TransportCommandFabric<string> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'TestCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: string) {
        super(TestCommand.NAME, request);
    }
}
