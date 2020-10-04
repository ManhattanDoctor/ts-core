import * as _ from 'lodash';
import { ITransportCryptoManager } from '@ts-core/common/transport/crypto';
import { ITransportCommand } from '@ts-core/common/transport/ITransport';
import { ISignature } from '@ts-core/common/crypto';
import { RSA } from '../RSA';

export class TransportCryptoManagerRSA implements ITransportCryptoManager {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = 'RSA';

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async sign<U>(command: ITransportCommand<U>, nonce: string, privateKey: string): Promise<string> {
        return RSA.sign(this.toString(command, nonce), privateKey);
    }

    public async verify<U>(command: ITransportCommand<U>, signature: ISignature): Promise<boolean> {
        return RSA.verify(this.toString(command, signature.nonce), signature.value, signature.publicKey);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected toString<U>(command: ITransportCommand<U>, nonce: string): string {
        let request = !_.isNil(command.request) ? command.request.toString() : '';
        return `${command.name}${request}${nonce}`;
    }

    public get algorithm(): string {
        return TransportCryptoManagerRSA.ALGORITHM;
    }
}
