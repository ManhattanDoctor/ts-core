import { ITransportSettings } from '@ts-core/common/transport';

export interface ITransportFabricSettings extends ITransportSettings {
    reconnectDelay?: number;
    reconnectMaxAttempts?: number;
    isExitApplicationOnDisconnect?: boolean;

    fabricNetworkName: string;
    fabricChaincodeName: string;
    fabricConnectionSettingsPath: string;

    fabricIdentity: string;
    fabricIdentityMspId: string;
    fabricIdentityPrivateKey: string;
    fabricIdentityCertificate: string;
}
