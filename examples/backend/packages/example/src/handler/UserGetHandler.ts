import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { TransportFabric } from '../fabric/transport';
import { TransportCommandFabricAsyncHandler } from '../fabric/transport/command';
import { ITransportFabricStub } from '../fabric/transport/stub';
import { User } from '../lib/user/User';
import { UserGetCommand } from './UserGetCommand';

@Injectable()
export class UserGetHandler extends TransportCommandFabricAsyncHandler<string, User, UserGetCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabric) {
        super(logger, transport, UserGetCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string, stub: ITransportFabricStub): Promise<User> {
        return stub.getState<User>(User.getUid(params), User);
    }
}
