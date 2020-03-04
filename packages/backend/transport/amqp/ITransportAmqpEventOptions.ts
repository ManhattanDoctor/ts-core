import { Options } from 'amqplib';
import { TransportAmqpEventPayload } from './TransportAmqpEventPayload';

export interface ITransportAmqpEventOptions<U = any> extends Options.Publish {
    queue: string;
    payload: TransportAmqpEventPayload<U>;
}
