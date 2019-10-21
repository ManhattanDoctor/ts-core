export interface IBtcInputInsight {
    txid: string;
    coinbase: boolean;
    vout: number;
    spentTxid: string;
    mintTxid: string;
    mintHeight: number;
    spentHeight: number;
    address: boolean;
    value: number;
}
