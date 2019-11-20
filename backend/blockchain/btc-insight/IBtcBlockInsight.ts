import { IBtcTransactionInsight } from './IBtcTransactionInsight';

export interface IBtcBlockInsight {
    number: number;
    createdDate: Date;
    transactions: Array<IBtcTransactionInsight>;

    chain: string;
    network: string;
    hash: string;
    height: number;
    version: number;
    size: number;
    merkleRoot: string;
    time: string;
    timeNormalized: string;
    nonce: number;
    bits: number;
    previousBlockHash: string;
    nextBlockHash: string;
    reward: number;
    transactionCount: number;
    confirmations: number;
}
