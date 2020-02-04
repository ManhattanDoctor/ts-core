export interface IEthTransactionReceipt {
    status: true;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    contractAddress: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs: Array<any>;
}
