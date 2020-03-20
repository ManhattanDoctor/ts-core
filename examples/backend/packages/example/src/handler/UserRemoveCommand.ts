import { TransformUtil } from '@ts-core/common/util';
import { TransportCommandFabricAsync } from '../fabric/transport/command';
import { User } from '../lib/user/User';

export class UserRemoveCommand extends TransportCommandFabricAsync<string, User> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'UserRemoveCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: string) {
        super(UserRemoveCommand.NAME, request);
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
