import * as _ from 'lodash';
import { IKeyAsymmetric } from '@ts-core/common/crypto';
import * as Gost from '@vostokplatform/crypto-gost-js';

const gost = Gost.CryptoGost;
export abstract class GostBase {
    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private static async importKey(algorithm: string, privateKey: string, goals: Array<string>): Promise<any> {
        return gost.subtle.importKey('raw', gost.coding.Hex.decode(privateKey), algorithm, true, goals);
    }

    private static formatKey(key: string): string {
        return !_.isNil(key) ? key.replace('\r\n', '') : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static nonce(): string {
        var nonce = new Uint8Array(8);
        gost.getRandomValues(nonce);
        return gost.coding.Hex.encode(nonce);
    }

    public static async keys(algorithm: string, goals: Array<string>): Promise<IKeyAsymmetric> {
        let keys = await gost.subtle.generateKey(algorithm, true, goals);
        let privateKey = await gost.subtle.exportKey('raw', keys.privateKey);
        let publicKey = await gost.subtle.exportKey('raw', keys.publicKey);
        return {
            privateKey: GostBase.formatKey(gost.coding.Hex.encode(privateKey)),
            publicKey: GostBase.formatKey(gost.coding.Hex.encode(publicKey))
        };
    }

    public static async sign(algorithm: string, message: string, privateKey: string): Promise<string> {
        let key = await GostBase.importKey(algorithm, privateKey, ['sign']);
        let signature = await gost.subtle.sign(algorithm, key, gost.coding.Chars.decode(message));
        return gost.coding.Hex.encode(signature);
    }

    public static async verify(algorithm: string, message: string, signature: string, publicKey: string): Promise<boolean> {
        let key = await GostBase.importKey(algorithm, publicKey, ['verify']);
        return gost.subtle.verify(algorithm, key, gost.coding.Hex.decode(signature), gost.coding.Chars.decode(message));
    }

    public static async encrypt(
        algorithm: string,
        message: string,
        senderPrivateKey: string,
        receiverPublicKey: string,
        nonce: string
    ): Promise<IGostEncrypted> {
        let pubicKey = await GostBase.importKey(algorithm, receiverPublicKey, ['verify', 'deriveKey']);
        let privateKey = await GostBase.importKey(algorithm, senderPrivateKey, ['sign', 'deriveKey']);

        let contentEncryptionKey = await gost.subtle.generateKey({ name: 'GOST28147' }, false, ['encrypt']);
        let keyEncryptionKey = await gost.subtle.deriveKey(
            { name: 'GOSTR3410', hash: { name: 'GOSTR3411' }, ukm: gost.coding.Hex.decode(nonce), public: pubicKey },
            privateKey,
            { name: 'GOST28147' },
            false,
            ['wrapKey']
        );

        let data = await gost.subtle.encrypt({ name: 'GOST28147-CFB' }, contentEncryptionKey, gost.coding.Chars.decode(message));
        let encryptedKey = await gost.subtle.wrapKey('raw', contentEncryptionKey, keyEncryptionKey, { name: 'GOST28147', ukm: gost.coding.Hex.decode(nonce) });

        return {
            data: gost.coding.Hex.encode(data),
            key: GostBase.formatKey(gost.coding.Hex.encode(encryptedKey))
        };
    }

    public static async decrypt(
        algorithm: string,
        message: IGostEncrypted,
        receiverPrivateKey: string,
        senderPublicKey: string,
        nonce: string
    ): Promise<string> {
        let pubicKey = await GostBase.importKey(algorithm, senderPublicKey, ['verify', 'deriveKey']);
        let privateKey = await GostBase.importKey(algorithm, receiverPrivateKey, ['sign', 'deriveKey']);

        let encryptedKey = gost.coding.Hex.decode(message.key);

        let keyEncryptionKey = await gost.subtle.deriveKey(
            { name: 'GOSTR3410', hash: { name: 'GOSTR3411' }, ukm: gost.coding.Hex.decode(nonce), public: pubicKey },
            privateKey,
            { name: 'GOST28147' },
            true,
            ['unwrapKey']
        );

        let contentEncryptionKey = await gost.subtle.unwrapKey(
            'raw',
            encryptedKey,
            keyEncryptionKey,
            { name: 'GOST28147', ukm: gost.coding.Hex.decode(nonce) },
            { name: 'GOST28147' },
            false,
            ['decrypt']
        );

        let data = await gost.subtle.decrypt({ name: 'GOST28147-CFB' }, contentEncryptionKey, gost.coding.Hex.decode(message.data));
        return gost.coding.Chars.encode(data);
    }
}

export interface IGostEncrypted {
    data: string;
    key: string;
}
