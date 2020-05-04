import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricAsyncHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { Logger } from '@ts-core/common/logger';

import { User } from '../lib/user/User';
import { UserGetCommand } from './UserGetCommand';
import { TransportFabricChaincode } from '@ts-core/blockchain-fabric/chaincode';

@Injectable()
export class UserGetHandler extends TransportCommandFabricAsyncHandler<string, User, UserGetCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincode) {
        super(logger, transport, UserGetCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string, command: UserGetCommand): Promise<User> {
        return command.stub.getState<User>(User.getUid(params), User);
    }
}
