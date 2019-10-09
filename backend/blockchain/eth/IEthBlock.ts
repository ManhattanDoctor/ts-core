import { IEthTransaction } from './IEthTransaction';

export interface IEthBlock extends IEthBlockGeth {
    number: number;
    createdDate: Date;
}

export interface IEthBlockGeth {
    number: number;
    difficulty: string;
    extraData: string;
    gasLimit: number;
    gasUsed: number;
    hash: string;
    logsBloom: string;
    miner: string;
    mixHash: string;
    nonce: string;
    parentHash: string;
    receiptsRoot: string;
    sha3Uncles: string;
    size: number;
    stateRoot: string;
    timestamp: number;
    totalDifficulty: string;
    transactions: Array<IEthTransaction>;
    transactionsRoot: string;
    uncles: Array<any>;
}
