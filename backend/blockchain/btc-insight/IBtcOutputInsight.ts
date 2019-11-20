export interface IBtcOutputInsight {
    txid: string;
    chain: string;
    network: string;
    coinbase: boolean;
    spentTxid: string;
    mintTxid: string;
    mintIndex: number;
    mintHeight: number;
    spentHeight: number;
    address: string;
    value: number;
    script: string;
    confirmations: number;
}
