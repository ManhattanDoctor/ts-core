import { ExtendedError } from '@ts-core/common/error';

export interface ITransportAmqpResponsePayload<V = any> {
    id: string;
    response?: V | ExtendedError;
}
