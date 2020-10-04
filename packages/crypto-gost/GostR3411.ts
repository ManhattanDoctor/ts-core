import * as _ from 'lodash';
import { GostBase, IGostEncrypted } from './GostBase';
import { IKeyAsymmetric } from '@ts-core/common/crypto';

export class GostR3411 {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = 'GOST R 34.11';

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static nonce(): string {
        return GostBase.nonce();
    }

    public static async keys(): Promise<IKeyAsymmetric> {
        return GostBase.keys(GostR3411.ALGORITHM, ['sign', 'verify']);
    }

    public static async encrypt(message: string, senderPrivateKey: string, receiverPublicKey: string, nonce: string): Promise<IGostEncrypted> {
        return GostBase.encrypt(GostR3411.ALGORITHM, message, senderPrivateKey, receiverPublicKey, nonce);
    }

    public static async decrypt(message: IGostEncrypted, receiverPrivateKey: string, senderPublicKey: string, nonce: string): Promise<string> {
        return GostBase.decrypt(GostR3411.ALGORITHM, message, receiverPrivateKey, senderPublicKey, nonce);
    }
}
