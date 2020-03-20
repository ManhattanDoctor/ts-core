import { TweetNaCl } from '@ts-core/common/crypto';
import { TransformUtil } from '@ts-core/common/util';
import { ITransportFabricCryptoManager } from './ITransportFabricCryptoManager';

export class TransportFabricCryptoManagerEd25519 implements ITransportFabricCryptoManager {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public sign<U>(request: U, privateKey: string): string {
        return TweetNaCl.sign(this.toString(request), privateKey);
    }

    public verify<U>(request: U, signature: string, publicKey: string): boolean {
        return TweetNaCl.verify(this.toString(request), signature, publicKey);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected toString<U>(request: U): string {
        return TransformUtil.fromJSON(TransformUtil.fromClass(request));
    }
}
