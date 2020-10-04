import * as _ from 'lodash';
import { IKeyAsymmetric } from '@ts-core/common/crypto';
import * as NodeRSA from 'node-rsa';

export class RSA {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = 'RSA';

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private static importKey(value: string): any {
        let item = new NodeRSA();
        item.importKey(value);
        return item;
    }

    private static formatKey(key: string): string {
        return !_.isNil(key) ? key : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static keys(bits?: number, exponent?: number): IKeyAsymmetric {
        if (_.isNil(bits)) {
            bits = 2048;
        }
        if (_.isNil(exponent)) {
            exponent = 65537;
        }
        let key = new NodeRSA();
        key.generateKeyPair(bits, exponent);
        return {
            publicKey: RSA.formatKey(key.exportKey('pkcs8-public-pem')),
            privateKey: RSA.formatKey(key.exportKey('pkcs8-private-pem'))
        };
    }

    public static sign(message: string, privateKey: string): string {
        let key = RSA.importKey(privateKey);
        return key.sign(Buffer.from(message)).toString('hex');
    }

    public static verify(message: string, signature: string, publicKey: string): boolean {
        let key = RSA.importKey(publicKey);
        return key.verify(Buffer.from(message), Buffer.from(signature, 'hex'));
    }

    public static encrypt(message: string, publicKey: string): string {
        let key = RSA.importKey(publicKey);
        return key.encrypt(Buffer.from(message)).toString('hex');
    }

    public static decrypt(message: string, privateKey: string): string {
        let key = RSA.importKey(privateKey);
        return key.decrypt(Buffer.from(message, 'hex')).toString();
    }
}
