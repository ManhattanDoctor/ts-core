import { Options } from 'amqplib';
import { TransportAmqpResponsePayload } from './TransportAmqpResponsePayload';

export interface ITransportAmqpResponseOptions<U = any, V = any> extends Options.Publish {
    queue: string;
    payload: TransportAmqpResponsePayload<U, V>;
}
