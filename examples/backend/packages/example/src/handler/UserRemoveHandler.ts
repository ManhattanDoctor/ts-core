import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricAsyncHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { Logger } from '@ts-core/common/logger';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';

import { User } from '../lib/user/User';
import { UserRemoveCommand } from './UserRemoveCommand';
import { TransportFabricChaincode } from '@ts-core/blockchain-fabric/chaincode';

@Injectable()
export class UserRemoveHandler extends TransportCommandFabricAsyncHandler<string, User, UserRemoveCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincode) {
        super(logger, transport, UserRemoveCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string, command: UserRemoveCommand): Promise<User> {
        let item = await command.stub.getState<User>(User.getUid(params));
        if (!_.isNil(item)) {
            await command.stub.removeState(User.getUid(params));
        }
        return item;
    }

    protected checkResponse(params: User): User {
        return TransformUtil.fromClass<User>(params);
    }
}
