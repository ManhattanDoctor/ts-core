import { IAmqpSettings } from '../../settings';

export interface ITransportAmqpSettings extends IAmqpSettings {
    reconnectDelay?: number;
    reconnectMaxAttempts?: number;
    isExitApplicationOnDisconnect?: boolean;

    queuePrefix?: string;
}
