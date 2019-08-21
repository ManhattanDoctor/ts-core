import * as Web3 from 'web3';

export class EthApiGeth {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static GAS_FEE_TRANSFER = 21000;

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    private client: Web3;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IEthApiSettingsGeth) {
        this.client = new Web3(new Web3.providers.HttpProvider(settings.endpoint));
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getBlockNumber(): Promise<number> {
        return this.client.eth.getBlockNumber();
    }

    public async getBlock(block: number, isNeedTransactions?: boolean): Promise<IEthBlockGeth> {
        return this.client.eth.getBlock(block, isNeedTransactions);
    }

    public async getGasPrice(): Promise<string> {
        return this.client.getGasPrice();
        // resolve(amount.toString(10));
    }

    public async getTransactionCount(address: string, block?: number): Promise<number> {
        return this.client.getTransactionCount(address, block);
    }
}

export enum EthApiDefaultBlock {
    LATEST = 'latest',
    PENDING = 'pending',
    EARLIEST = 'earliest'
}
export interface IEthApiSettingsGeth {
    endpoint: string;
}

export interface IEthBlockGeth {
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
    transactions: Array<IEthTransactionGeth>;
    transactionsRoot: string;
    uncles: Array<any>;
}

export interface IEthTransactionGeth {
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
