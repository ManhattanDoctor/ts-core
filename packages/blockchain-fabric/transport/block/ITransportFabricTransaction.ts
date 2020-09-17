import { ITransportFabricRequestPayload } from '../TransportFabricRequestPayload';
import { ITransportFabricResponsePayload } from '../TransportFabricResponsePayload';
import { FabricTransactionValidationCode } from '../../api/IFabricTransaction';
import { ITransportFabricTransactionChaincode } from './ITransportFabricTransactionChaincode';

export interface ITransportFabricTransaction<U = any, V = any> {
    hash: string;
    channel: string;
    createdDate: Date;
    chaincode: ITransportFabricTransactionChaincode;
    validationCode: FabricTransactionValidationCode;

    request: ITransportFabricRequestPayload<U>;
    response: ITransportFabricResponsePayload<V>;
}
