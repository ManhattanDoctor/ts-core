import { TweetNaCl } from '@ts-core/common/crypto';

export class FabricUtil {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public static toUserId(publicKey: string): string {
        return TweetNaCl.hash(publicKey);
    }
}
