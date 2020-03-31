import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command';

export class TestCommand extends TransportCommandFabricAsync<string, string> {
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
