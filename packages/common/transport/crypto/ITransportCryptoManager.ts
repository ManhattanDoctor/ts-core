import { ITransportCommand } from '../ITransport';
import { ISignature } from '../../crypto';

export interface ITransportCryptoManager {
    sign<U>(command: ITransportCommand<U>, nonce: string, privateKey: string): Promise<string>;
    verify<U>(command: ITransportCommand<U>, signature: ISignature): Promise<boolean>;
    readonly algorithm: string;
}
