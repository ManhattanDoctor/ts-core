export interface IEthTransaction {
    blockHash: string;
    blockNumber: number;
    transactionIndex: number;

    to: string;
    gas: string;
    hash: string;
    from: string;
    gasPrice: string;
    input: string;
    nonce: number;
    value: string;

    r: string;
    s: string;
    v: string;
}
