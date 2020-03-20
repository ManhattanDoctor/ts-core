import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { TransportFabric } from '../fabric/transport';
import { TransportCommandFabricAsyncHandler } from '../fabric/transport/command';
import { ITransportFabricStub } from '../fabric/transport/stub';
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
