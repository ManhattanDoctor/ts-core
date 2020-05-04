import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command';

export class TestCommand extends TransportCommandFabricAsync<any, any> {
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

    constructor(request: any) {
        super(TestCommand.NAME, request);
    }
}
