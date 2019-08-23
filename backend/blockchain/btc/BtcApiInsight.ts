/*
import axios, { AxiosInstance } from 'axios';
import * as _ from 'lodash';
import { IBtcApiSettingsInsight } from './BtcApiInsight';

export class BtcApiInsignt {
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

    constructor(settings: IBtcApiSettingsInsight) {
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

        return item;
    }

    public async getBlock(block: number, isNeedTransactions?: boolean): Promise<IBtcBlockInsight> {
        let item = (await this.client.get<IBtcBlockInsight>(`block/${block}`)).data;
        item.number = item.height;
        if (isNeedTransactions) {
            item.transactions = (await this.client.get<Array<IBtcTransactionInsight>>(`tx?blockHeight=${block}`)).data;
            for (let transaction of item.transactions) {
                await this.getTransaction(transaction, true);
            }
        }
        return item;
    }
}

export interface IBtcApiSettingsInsight {
    endpoint: string;
}

export interface IBtcBlockInsight {
    number: number;
    transactions: Array<IBtcTransactionInsight>;

    height: number;
}

export interface IBtcTransactionInsight {
    txid: string;
    inputs: Array<IBtcInputInsight>;
    outputs: Array<IBtcOutputInsight>;
}

export interface IBtcInputInsight {}

export interface IBtcOutputInsight {}
*/
