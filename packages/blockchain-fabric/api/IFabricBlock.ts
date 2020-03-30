import { TransportFabricRequestPayload, ITransportFabricRequestPayload } from '../transport/TransportFabricRequestPayload';
import { ITransportFabricResponsePayload } from '../transport/TransportFabricResponsePayload';

export interface IFabricBlock {
    number: number;
    createdDate: Date;
    events: Array<IFabricEvent>;
    transactions: Array<IFabricTransaction>;

    // data: { data: BlockData[] };
    // metadata: { metadata: any };
}

export interface IFabricEvent<U = any> {}

export interface IFabricTransaction<U = any, V = any> {
    chaincode: IFabricTransactionChaincode;

    request: ITransportFabricRequestPayload<U>;
    response: ITransportFabricResponsePayload<V>;
}

export interface IFabricTransactionChaincode {
    path: string;
    name: string;
    version: string;
}
