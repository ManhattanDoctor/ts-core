import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricAsyncHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { ExtendedError } from '@ts-core/common/error';
import { Logger } from '@ts-core/common/logger';
import { ObjectUtil, TransformUtil } from '@ts-core/common/util';

import { User } from '../lib/user/User';
import { UserAccount, UserAccountType } from '../lib/user/UserAccount';
import { IUserAddDto, UserAddCommand } from './UserAddCommand';

@Injectable()
export class UserAddHandler extends TransportCommandFabricAsyncHandler<IUserAddDto, User, UserAddCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabric) {
        super(logger, transport, UserAddCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IUserAddDto, stub: ITransportFabricStub): Promise<User> {
        if (await stub.hasState(User.getUid(params.id))) {
            throw new ExtendedError(`Unable to create user: user "${params.id}" already exists`);
        }

        let user = new User();
        user.createdDate = new Date();
        ObjectUtil.copyProperties(params, user, ['id', 'publicKey']);

        let account = (user.account = new UserAccount());
        account.type = UserAccountType.ADMINISTRATOR;
        
        return stub.putState(user.uid, user);
    }

    protected checkResponse(params: User): User {
        return TransformUtil.fromClass<User>(params);
    }
}
