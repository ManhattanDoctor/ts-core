import { TransportCommandWaitDelay } from './ITransport';

export interface ITransportSettings {
    defaultTimeout?: number;
    defaultWaitDelay?: TransportCommandWaitDelay;
    defaultWaitMaxCount?: number;
}
