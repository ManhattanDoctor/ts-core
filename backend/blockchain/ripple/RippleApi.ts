import axios, { AxiosInstance } from 'axios';
import * as _ from 'lodash';
import { ILogger, LoggerWrapper } from '../../../common/logger';

export class RippleInsignt extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    /*
    public static parseBlock(item: IBtcBlockInsight): void {
        if (_.isNil(item)) {
            return;
        }
        item.number = item.height;
        if (!_.isEmpty(item.transactions)) {
            item.transactions.forEach(BtcApiInsignt.parseTransaction);
        }
    }

    public static parseTransaction(item: IBtcTransactionInsight): void {
        if (_.isNil(item)) {
            return;
        }
        if (!_.isEmpty(item.inputs)) {
            item.inputs.forEach(BtcApiInsignt.parseInput);
        }
        if (!_.isEmpty(item.outputs)) {
            item.outputs.forEach(BtcApiInsignt.parseOutput);
        }
    }
    */

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    private client: AxiosInstance;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IRippleApiSettings, logger?: ILogger) {
        super(logger);
        this.client = axios.create({ baseURL: settings.endpoint });
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getBlockNumber(): Promise<number> {
        let item = (await this.client.get(`block/tip`)).data;
        return item.height;
    }

    /*
    public async getBlock(block: number | IBtcBlockInsight, isNeedTransactions?: boolean): Promise<IBtcBlockInsight> {
        let item: IBtcBlockInsight = null;
        if (_.isNumber(block)) {
            item = (await this.client.get<IBtcBlockInsight>(`block/${block}`)).data;
        } else {
            item = item as IBtcBlockInsight;
        }

        if (isNeedTransactions) {
            item.transactions = (await this.client.get<Array<IBtcTransactionInsight>>(`tx?blockHeight=${block}`)).data;
            for (let transaction of item.transactions) {
                await this.getTransaction(transaction, true);
            }
        }
        BtcApiInsignt.parseBlock(item);
        return item;
    }

    public async getTransaction(transaction: string | IBtcTransactionInsight, isNeedDetails?: boolean): Promise<IBtcTransactionInsight> {
        let item: IBtcTransactionInsight = null;
        if (_.isString(transaction)) {
            item = (await this.client.get<IBtcTransactionInsight>(`tx/${transaction}`)).data;
        } else {
            item = transaction as IBtcTransactionInsight;
        }

        if (isNeedDetails) {
            let response = (await this.client.get(`tx/${item.txid}/coins`)).data;
            item.inputs = response.inputs;
            item.outputs = response.outputs;
        }

        BtcApiInsignt.parseTransaction(item);
        return item;
    }

    public async getBalance(address: string): Promise<IBtcApiBalanceInsight> {
        let item = await this.client.get<IBtcApiBalanceInsight>(`address/${address}/balance`);
        return item.data;
    }
    */
}

export interface IRippleApiSettings {
    endpoint: string;
}
