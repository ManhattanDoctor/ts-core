export interface IBtcInputInsight {
    txid: string;
    chain: string;
    network: string;
    mintIndex: number;
    coinbase: boolean;
    spentTxid: string;
    mintTxid: string;
    mintHeight: number;
    spentHeight: number;
    address: string;
    script: string;
    value: number;
    confirmations: number;
}
