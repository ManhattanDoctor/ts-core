import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricAsyncHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { Logger } from '@ts-core/common/logger';

import { UserAccount, UserAccountType } from '../lib/user/UserAccount';
import { TestCommand } from './TestCommand';
import { ExtendedError } from '@ts-core/common/error';

@Injectable()
export class TestHandler extends TransportCommandFabricAsyncHandler<string, string, TestCommand> {
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

    protected async execute(params: string, stub: ITransportFabricStub): Promise<string> {
        if (params === 'Seven') {
            throw new ExtendedError('Hello');
        }

        let value = await stub.getState('test', UserAccount);
        value = new UserAccount();
        value['name'] = params;
        value.type = UserAccountType.ADMINISTRATOR;
        await stub.putState('test', value);
        console.log('OK');
        return params;
    }
}
