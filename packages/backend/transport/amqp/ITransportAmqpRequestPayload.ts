import { ITransportCommandOptions } from '@ts-core/common/transport';

export interface ITransportAmqpRequestPayload<U = any> {
    id: string;
    name: string;
    request?: U;
    options: ITransportCommandOptions;
    isNeedReply: boolean;
}
