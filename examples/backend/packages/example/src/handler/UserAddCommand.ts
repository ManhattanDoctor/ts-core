import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command';
import { TransformUtil } from '@ts-core/common/util';

import { User } from '../lib/user/User';

export class UserAddCommand extends TransportCommandFabricAsync<IUserAddDto, User> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'UserAddCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserAddDto) {
        super(UserAddCommand.NAME, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(item: User): User {
        return TransformUtil.toClass(User, item);
    }
}

export interface IUserAddDto {
    id: string;
    publicKey: string;
}