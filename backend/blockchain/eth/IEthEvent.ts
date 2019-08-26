export interface IEthEvent<T = any> {
    returnValues: T;
    raw: {
        data: string;
        topics: Array<string>;
    };
    event: string;
    signature: string;
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    address: string;
}
