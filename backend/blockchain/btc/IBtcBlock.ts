import { IBtcTransaction } from './IBtcTransaction';

export interface IBtcBlock extends IBtcBlockBitcore {
    number: number;
    createdDate: Date;
    transactions: Array<IBtcTransaction>;
}

interface IBtcBlockBitcore {
    hash: string;
    tx: Array<IBtcTransaction>;
    confirmations: number;
    strippedsize: number;
    size: number;
    weight: number;
    height: number;
    version: number;
    versionHex: string;
    merkleroot: string;
    time: number;
    mediantime: number;
    nonce: number;
    bits: string;
    difficulty: number;
    chainwork: string;
    nTx: number;
    previousblockhash: string;
    nextblockhash: string;
}
