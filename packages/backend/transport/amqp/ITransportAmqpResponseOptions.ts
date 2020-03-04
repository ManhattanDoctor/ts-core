import { Options } from 'amqplib';
import { TransportAmqpResponsePayload } from './TransportAmqpResponsePayload';

export interface ITransportAmqpResponseOptions<U = any, V = any> extends Options.Publish {
    payload: TransportAmqpResponsePayload<U, V>;
}
