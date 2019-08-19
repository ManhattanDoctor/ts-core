import { IBlock } from '@monitor/core/block';
import { IEthTransaction } from './IEthTransaction';

export interface IEthBlock extends IBlock<IEthTransaction> {
    difficulty: string;
    extraData: string;
    gasLimit: number;
    gasUsed: number;
    hash: string;
    logsBloom: string;
    miner: string;
    mixHash: string;
    nonce: string;
    number: number;
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
