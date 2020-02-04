import { IBtcInputInsight } from './IBtcInputInsight';
import { IBtcOutputInsight } from './IBtcOutputInsight';

export interface IBtcTransactionInsight {
    inputs: Array<IBtcInputInsight>;
    outputs: Array<IBtcOutputInsight>;

    _id: string;
    txid: string;
    network: string;
    blockHeight: number;
    blockHash: string;
    blockTime: string;
    blockTimeNormalized: string;
    coinbase: boolean;
    locktime: number;
    size: number;
    fee: number;
    confirmations: number;
}
