import * as _ from 'lodash';
import { Ed25519 } from './Ed25519';
import { Sha512 } from './hash';
import { IKeyAsymmetric } from './IKeyAsymmetric';

export class TweetNaCl {
    // --------------------------------------------------------------------------
    //
    //  Crypto Methods
    //
    // --------------------------------------------------------------------------

    public static keyPair(): IKeyAsymmetric {
        return Ed25519.keys();
    }

    public static sign(message: string, privateKey: string): string {
        return Ed25519.sign(message, privateKey);
    }

    public static verify(message: string, signature: string, publicKey: string): boolean {
        return Ed25519.verify(message, signature, publicKey);
    }

    public static encrypt(message: string, key: string, nonce: string): string {
        return Ed25519.encrypt(message, key, nonce);
    }

    public static decrypt(message: string, key: string, nonce: string): string {
        return Ed25519.decrypt(message, key, nonce);
    }

    public static hash(message: string, nonce?: string): string {
        if (!_.isNil(nonce)) {
            message += nonce;
        }
        return Sha512.hex(message);
    }

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    public static sha512(message: string): Buffer {
        return Sha512.hash(Buffer.from(message));
    }
}
