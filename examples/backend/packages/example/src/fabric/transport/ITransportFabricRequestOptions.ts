import { TransportFabricRequestPayload } from './TransportFabricRequestPayload';

export interface ITransportFabricRequestOptions<U = any> {
    method: string;
    payload: TransportFabricRequestPayload<U>;
}
