import { Injectable } from '@nestjs/common';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { Logger } from '@ts-core/common/logger';

import { ChaincodeTransportBased, TransportFabricChaincode } from '@ts-core/blockchain-fabric/chaincode';

@Injectable()
export class Chaincode extends ChaincodeTransportBased<void> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincode) {
        super(logger, transport);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get name(): string {
        return `Test chaincode`;
    }
}
