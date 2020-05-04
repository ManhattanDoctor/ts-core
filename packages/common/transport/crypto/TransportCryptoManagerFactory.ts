import * as _ from 'lodash';
import { ITransportCryptoManager } from './ITransportCryptoManager';
import { TransportCryptoManagerEd25519 } from './TransportCryptoManagerEd25519';
import { ExtendedError } from '../../error';
import { ITransportCommand } from '../ITransport';
import { ISignature } from '../../crypto';

export class TransportCryptoManagerFactory {
    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private static items: Map<string, ITransportCryptoManager>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static get(algorithm: string): ITransportCryptoManager {
        let items = TransportCryptoManagerFactory.items;
        if (!items) {
            items = TransportCryptoManagerFactory.items = new Map();
        }

        if (items.has(algorithm)) {
            return items.get(algorithm);
        }

        let item: ITransportCryptoManager = null;
        switch (algorithm) {
            case TransportCryptoManagerEd25519.ALGORITHM:
                item = new TransportCryptoManagerEd25519();
                break;
            default:
                throw new ExtendedError(`Unable to find crypto manager for "${algorithm}" algorithm`);
        }

        items.set(algorithm, item);
        return item;
    }

    public static sign<U>(algorithm: string, command: ITransportCommand<U>, nonce: string, privateKey: string): string {
        return TransportCryptoManagerFactory.get(algorithm).sign(command, nonce, privateKey);
    }

    public static verify<U>(algorithm: string, command: ITransportCommand<U>, signature: ISignature): boolean {
        return TransportCryptoManagerFactory.get(algorithm).verify(command, signature);
    }
}
