import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command';
import { TransformUtil } from '@ts-core/common/util';

import { User } from '../lib/user/User';

export class UserGetCommand extends TransportCommandFabricAsync<string, User> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'UserGetCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: string) {
        super(UserGetCommand.NAME, request);
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
