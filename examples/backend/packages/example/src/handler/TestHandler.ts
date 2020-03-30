import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { Logger } from '@ts-core/common/logger';

import { UserAccount, UserAccountType } from '../lib/user/UserAccount';
import { TestCommand } from './TestCommand';

@Injectable()
export class TestHandler extends TransportCommandFabricHandler<string, TestCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabric) {
        super(logger, transport, TestCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string, stub: ITransportFabricStub): Promise<void> {
        let value = await stub.getState('test', UserAccount);
        console.log(1, params, value);

        value = new UserAccount();
        value.type = UserAccountType.ADMINISTRATOR;
        await stub.putState('test', value);

        console.log(2, params, value);
    }
}
