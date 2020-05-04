import { ITransportCommand } from '../ITransport';
import { Ed25519, ISignature } from '../../crypto';
import * as _ from 'lodash';
import { ITransportCryptoManager } from './ITransportCryptoManager';

export class TransportCryptoManagerEd25519 implements ITransportCryptoManager {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = 'Ed25519';

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public sign<U>(command: ITransportCommand<U>, nonce: string, privateKey: string): string {
        return Ed25519.sign(this.toString(command, nonce), privateKey);
    }

    public verify<U>(command: ITransportCommand<U>, signature: ISignature): boolean {
        return Ed25519.verify(this.toString(command, signature.nonce), signature.value, signature.publicKey);
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
        return TransportCryptoManagerEd25519.ALGORITHM;
    }
}
