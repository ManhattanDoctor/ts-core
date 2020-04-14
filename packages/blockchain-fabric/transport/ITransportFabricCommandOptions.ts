import { ITransportCommandOptions } from '@ts-core/common/transport';

export interface ITransportFabricCommandOptions extends ITransportCommandOptions {
    fabricUserId?: string;
    fabricUserPublicKey?: string;
    fabricUserPrivateKey?: string;

    internalLinkId?: string;
}
