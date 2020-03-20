import { Options } from 'amqplib';

export interface ITransportAmqpResponseOptions<U = any, V = any> extends Options.Publish {
    payload: any;
}
