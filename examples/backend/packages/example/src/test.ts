import { UserAddCommand, IUserAddDto, IUserAddDtoResponse } from "./handler/TestCommand";
import { TransportCommandFabricAsyncHandler } from "@ts-core/blockchain-fabric/transport/command";
import { Logger } from "@ts-core/common/logger";
import { TransportFabricChaincode } from "@ts-core/blockchain-fabric/chaincode";
import { RandomUtil } from "@ts-core/common/util";
import { User } from "./lib/user/User";

export class UserAddHandler extends TransportCommandFabricAsyncHandler<IUserAddDto, IUserAddDtoResponse, UserAddCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincode) {
        super(logger, transport, UserAddCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IUserAddDto, command: UserAddCommand): Promise<IUserAddDtoResponse> {
        // Do something
        let user = new User();
        user.id = RandomUtil.randomString();
        await command.stub.putState(`user${user.id}`, user);
        return user.id;
    }
}
