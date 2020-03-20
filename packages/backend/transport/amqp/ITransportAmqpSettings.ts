import { ITransportSettings } from '@ts-core/common/transport';
import { IAmqpSettings } from '../../settings';

export interface ITransportAmqpSettings extends IAmqpSettings, ITransportSettings {
    amqpQueuePrefix?: string;

    reconnectDelay?: number;
    reconnectMaxAttempts?: number;
    isExitApplicationOnDisconnect?: boolean;
}
