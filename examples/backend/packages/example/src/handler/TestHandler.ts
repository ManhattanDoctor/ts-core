import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TransportCommandFabricAsyncHandler } from '@ts-core/blockchain-fabric/transport/command';
import { ITransportFabricStub } from '@ts-core/blockchain-fabric/transport/stub';
import { Logger } from '@ts-core/common/logger';

import { UserAccount, UserAccountType } from '../lib/user/UserAccount';
import { TestCommand } from './TestCommand';
import { ExtendedError } from '@ts-core/common/error';
import { TransportFabricChaincode } from '@ts-core/blockchain-fabric/chaincode';

@Injectable()
export class TestHandler extends TransportCommandFabricAsyncHandler<any, any, TestCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincode) {
        super(logger, transport, TestCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: any, command: TestCommand): Promise<string> {
        return params;
    }

    /*
    public async queryAllCars(command: TestCommand): Promise<string> {
        const startKey = 'CAR0';
        const endKey = 'CAR999';
        const allResults = [];
        for await (const { key, value } of command.stub.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
    */
}
