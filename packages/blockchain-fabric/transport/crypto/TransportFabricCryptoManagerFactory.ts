import { ITransportFabricCryptoManager, TransportFabricCryptoAlgorithm } from './ITransportFabricCryptoManager';
import { TransportFabricCryptoManagerEd25519 } from './TransportFabricCryptoManagerEd25519';
import { UnreachableStatementError } from '@ts-core/common/error';
import * as _ from 'lodash';

export class TransportFabricCryptoManagerFactory {
    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private static items: Map<TransportFabricCryptoAlgorithm, ITransportFabricCryptoManager>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static get(algorithm: TransportFabricCryptoAlgorithm): ITransportFabricCryptoManager {
        let items = TransportFabricCryptoManagerFactory.items;
        if (!items) {
            items = TransportFabricCryptoManagerFactory.items = new Map();
        }

        if (items.has(algorithm)) {
            return items.get(algorithm);
        }

        let item: ITransportFabricCryptoManager = null;
        switch (algorithm) {
            case TransportFabricCryptoAlgorithm.ED25519:
                item = new TransportFabricCryptoManagerEd25519();
                break;
            default:
                throw new UnreachableStatementError(algorithm);
        }

        items.set(algorithm, item);
        return item;
    }
}
