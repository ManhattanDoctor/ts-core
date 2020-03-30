import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricAsyncHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { Logger } from '@ts-core/common/logger';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';

import { User } from '../lib/user/User';
import { UserRemoveCommand } from './UserRemoveCommand';

@Injectable()
export class UserRemoveHandler extends TransportCommandFabricAsyncHandler<string, User, UserRemoveCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabric) {
        super(logger, transport, UserRemoveCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string, stub: ITransportFabricStub): Promise<User> {
        let item = await stub.getState<User>(User.getUid(params));
        if (!_.isNil(item)) {
            await stub.deleteState(User.getUid(params));
        }
        return item;
    }

    protected checkResponse(params: User): User {
        return TransformUtil.fromClass<User>(params);
    }
}
