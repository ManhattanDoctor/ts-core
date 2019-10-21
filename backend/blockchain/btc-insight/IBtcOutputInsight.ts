export interface IBtcOutputInsight {
    txid: string;
    coinbase: boolean;
    vout: 0;
    spentTxid: string;
    mintTxid: string;
    mintHeight: number;
    spentHeight: number;
    address: boolean;
    value: number;
}
