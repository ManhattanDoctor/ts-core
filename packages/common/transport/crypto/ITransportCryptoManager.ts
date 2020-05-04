import { ITransportCommand } from '../ITransport';
import { ISignature } from '../../crypto';

export interface ITransportCryptoManager {
    sign<U>(command: ITransportCommand<U>, nonce: string, privateKey: string): string;
    verify<U>(command: ITransportCommand<U>, signature: ISignature): boolean;

    readonly algorithm: string;
}
