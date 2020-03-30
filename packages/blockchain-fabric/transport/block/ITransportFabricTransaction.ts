import { ITransportFabricRequestPayload } from '../TransportFabricRequestPayload';
import { ITransportFabricResponsePayload } from '../TransportFabricResponsePayload';

export interface ITransportFabricTransaction<U = any, V = any> {
    id: string;
    timestamp: string;
    channelId: string;
    chaincode: { name: string; version: string; path: string };

    request: ITransportFabricRequestPayload<U>;
    response: ITransportFabricResponsePayload<V>;
}
