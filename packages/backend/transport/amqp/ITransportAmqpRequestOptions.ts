import { Options } from 'amqplib';
import { TransportAmqpRequestPayload } from './TransportAmqpRequestPayload';

export interface ITransportAmqpRequestOptions<U = any> extends Options.Publish {
    queue: string;
    payload: TransportAmqpRequestPayload<U>;
}
