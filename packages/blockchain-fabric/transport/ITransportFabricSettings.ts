import { ITransportSettings } from '@ts-core/common/transport';
import { IFabricApiSettings } from '../api';

export interface ITransportFabricSettings extends IFabricApiSettings, ITransportSettings {
    reconnectDelay?: number;
    reconnectMaxAttempts?: number;
    isExitApplicationOnDisconnect?: boolean;
}
