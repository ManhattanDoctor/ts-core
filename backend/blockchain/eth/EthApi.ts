import * as Web3 from 'web3';
import { PromiseHandler } from '../../../common/promise';
import { IEthBlock } from './IEthBlock';
import { IEthTransaction } from './IEthTransaction';

export class EthApi {
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

    protected client: Web3;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IEthApiSettings) {
        this.client = new Web3(new Web3.providers.HttpProvider(settings.endpoint));
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public contractCreate(abi: any, address: string): any {
        return new this.client.eth.Contract(abi, address);
    }

    public contractCall<T>(contract: any, name: string, args: Array<any>, options?: any): Promise<T> {
        let promise = PromiseHandler.create<T>();
        contract.methods[name](...args).call(options, (error, data) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve(data);
            }
        });
        return promise.promise;
    }

    public async getBlockNumber(): Promise<number> {
        return this.client.eth.getBlockNumber();
    }

    public async getBlock(block: number | EthApiDefaultBlock, isNeedTransactions?: boolean): Promise<IEthBlock> {
        return this.client.eth.getBlock(block, isNeedTransactions);
    }

    public async getBalance(address: string, block: number | EthApiDefaultBlock = EthApiDefaultBlock.LATEST): Promise<string> {
        return this.client.eth.getBalance(address, block);
    }

    public async getGasPrice(): Promise<string> {
        return this.client.getGasPrice();
        // resolve(amount.toString(10));
    }

    public async getTransactionCount(address: string, block?: number): Promise<number> {
        return this.client.getTransactionCount(address, block);
    }

    public async getTransaction(id: string): Promise<IEthTransaction> {
        return this.client.eth.getTransaction(id);
    }
}

export enum EthApiDefaultBlock {
    LATEST = 'latest',
    PENDING = 'pending',
    EARLIEST = 'earliest'
}
export interface IEthApiSettings {
    endpoint: string;
}
