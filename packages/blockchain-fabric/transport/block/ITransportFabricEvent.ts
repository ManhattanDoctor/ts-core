import { ITransportEvent } from '@ts-core/common/transport';

export interface ITransportFabricEvent<T = any> extends ITransportEvent<T> {
    channel: string;
    chaincode: string;
    createdDate: Date;
    transactionHash: string;
}
