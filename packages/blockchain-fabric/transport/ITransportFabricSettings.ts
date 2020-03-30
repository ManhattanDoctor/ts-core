import { ITransportSettings } from '@ts-core/common/transport';
import { ITransportFabricCryptoManager } from './crypto/ITransportFabricCryptoManager';

export interface ITransportFabricSettings extends ITransportSettings {
    reconnectDelay?: number;
    reconnectMaxAttempts?: number;
    isExitApplicationOnDisconnect?: boolean;

    readonly fabricCryptoManager?: ITransportFabricCryptoManager;

    readonly fabricUserPublicKey?: string;
    readonly fabricUserPrivateKey?: string;

    readonly fabricNetworkName: string;
    readonly fabricChaincodeName: string;
    readonly fabricConnectionSettingsPath: string;

    readonly fabricIdentity: string;
    readonly fabricIdentityMspId: string;
    readonly fabricIdentityPrivateKey: string;
    readonly fabricIdentityCertificate: string;
}