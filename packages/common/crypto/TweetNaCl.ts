import * as _ from 'lodash';
import * as nacl from 'tweetnacl';

export class TweetNaCl {
    // --------------------------------------------------------------------------
    //
    //  Crypto Methods
    //
    // --------------------------------------------------------------------------

    public static keyPair(): { privateKey: string; publicKey: string } {
        let keys = nacl.sign.keyPair();
        return { publicKey: Buffer.from(keys.publicKey).toString('hex'), privateKey: Buffer.from(keys.secretKey).toString('hex') };
    }

    public static sign(message: string, privateKey: string): string {
        return Buffer.from(nacl.sign.detached(Buffer.from(message), Buffer.from(privateKey, 'hex'))).toString('hex');
    }

    public static verify(message: string, signature: string, publicKey: string): boolean {
        return nacl.sign.detached.verify(Buffer.from(message), Buffer.from(signature, 'hex'), Buffer.from(publicKey, 'hex'));
    }

    public static encrypt(message: string, key: string, nonce: string): string {
        return Buffer.from(nacl.secretbox(Buffer.from(message), Buffer.from(nonce), Buffer.from(key, 'hex'))).toString('hex');
    }

    public static decrypt(message: string, key: string, nonce: string): string {
        return Buffer.from(nacl.secretbox.open(Buffer.from(message, 'hex'), Buffer.from(nonce), Buffer.from(key, 'hex'))).toString('utf8');
    }

    public static hash(message: string, nonce?: string): string {
        if (_.isNil(nonce)) {
            nonce = '';
        }
        return TweetNaCl.sha512(message + nonce).toString('hex');
    }

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    public static sha512(message: string): Buffer {
        return Buffer.from(nacl.hash(Buffer.from(message)));
    }
}
