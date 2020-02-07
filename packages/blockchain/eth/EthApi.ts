import { PromiseHandler } from '@ts-core/common/promise';
import { DateUtil } from '@ts-core/common/util';
import Web3, * as GLOBAL_WEB3 from 'web3';
import { IEthBlock } from './IEthBlock';
import { IEthTransaction } from './IEthTransaction';
import { IEthTransactionReceipt } from './IEthTransactionReceipt';

export class EthApi {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static GAS_FEE_TRANSFER = 21000;

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseBlock(item: IEthBlock): void {
        item.createdDate = DateUtil.parseDate(Number(item.timestamp) * DateUtil.MILISECONDS_SECOND);
    }

    private static get Web3(): any {
        return GLOBAL_WEB3 as any;
    }

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
        this.client = new EthApi.Web3(new EthApi.Web3.providers.HttpProvider(settings.endpoint));
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async sendSignedTransaction(data: string): Promise<IEthTransactionReceipt> {
        return this.client.eth.sendSignedTransaction(data);
    }

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
        let item = (await this.client.eth.getBlock(block, isNeedTransactions as any)) as IEthBlock;
        EthApi.parseBlock(item);
        return item;
    }

    public async getBalance(address: string, block: number | EthApiDefaultBlock = EthApiDefaultBlock.LATEST): Promise<string> {
        return this.client.eth.getBalance(address, block);
    }

    public async getGasPrice(): Promise<string> {
        return this.client.eth.getGasPrice();
    }

    public async getTransactionCount(address: string, block?: number): Promise<number> {
        return this.client.eth.getTransactionCount(address, block);
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
