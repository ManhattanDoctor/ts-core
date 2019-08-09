import * as Web3 from 'web3';
import { IEthBlock } from './IEthBlock';

export class EthApi {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    // ETH Infura    :  https://mainnet.infura.io/mew
    // ETH Etherscan :  https://api.etherscan.io/api
    // ETH Local:       http://217.29.56.143:8547

    // ETC Infura    :  https://etc-geth.0xinfra.com
    // ETC Local     :  http://217.29.56.144:8549

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    public static GAS_FEE_TRANSFER = 21000;

    private web3: Web3;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IEthApiSettings) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(settings.endpoint));
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getBlockNumber(): Promise<number> {
        return this.web3.eth.getBlockNumber();
    }

    public async getBlock(block: EthApiBlock, isNeedTransactions?: boolean): Promise<IEthBlock> {
        return this.web3.eth.getBlock(block, isNeedTransactions);
    }

    public async getGasPrice(): Promise<string> {
        return this.web3.getGasPrice();
        // resolve(amount.toString(10));
    }

    public async getTransactionCount(address: string, block?: EthApiBlock): Promise<number> {
        return this.web3.getTransactionCount(address, block);
    }
}

export declare type EthApiBlock = number | EthApiDefaultBlock;

export enum EthApiDefaultBlock {
    LATEST = 'latest',
    PENDING = 'pending',
    EARLIEST = 'earliest'
}
export interface IEthApiSettings {
    endpoint: string;
}
