import * as _ from 'lodash';
import * as nacl from 'tweetnacl';

export class Sha512 {
    // --------------------------------------------------------------------------
    //
    //  Crypto Methods
    //
    // --------------------------------------------------------------------------

    public static hex(message: string): string {
        return Sha512.hash(Buffer.from(message)).toString('hex');
    }

    public static hash(message: Buffer): Buffer {
        return Buffer.from(nacl.hash(message));
    }
}
