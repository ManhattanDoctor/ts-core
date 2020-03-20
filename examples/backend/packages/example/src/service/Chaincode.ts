import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { TransportFabric } from '../fabric/transport/TransportFabric';
import { ChaincodeBaseService } from './ChaincodeBaseService';

@Injectable()
export class Chaincode extends ChaincodeBaseService<void> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected transport: TransportFabric) {
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
