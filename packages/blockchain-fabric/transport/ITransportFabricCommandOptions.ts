import { ITransportCommandOptions } from '@ts-core/common/transport';
import { ISignature } from '@ts-core/common/crypto';

export interface ITransportFabricCommandOptions extends ITransportCommandOptions {
    userId: string;
    signature: ISignature;
}
