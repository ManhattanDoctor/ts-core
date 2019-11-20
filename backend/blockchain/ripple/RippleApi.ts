import { ExtendedError } from '@ts-core/common/error';
import { ObjectUtil } from '@ts-core/common/util';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as _ from 'lodash';
import { ILogger, LoggerWrapper } from '../../../common/logger';
import { IRippleLedger } from './IRippleLedger';
import { IRippleTransaction } from './IRippleTransaction';

export class RippleApi extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseLedger(item: IRippleLedger): void {
        if (_.isNil(item)) {
            return;
        }

        item.number = parseInt(item.ledger_index.toString(), 10);
        if (!_.isEmpty(item.transactions)) {
            item.transactions.forEach(RippleApi.parseTransaction);
        }
    }

    public static parseTransaction(item: IRippleTransaction): void {
        if (_.isNil(item)) {
            return;
        }
    }

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
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private async call<T = any>(methodName: string, params?: any): Promise<T> {
        if (_.isNil(params)) {
            params = {};
        }
        let response = await this.client.post(``, { method: methodName, params: [params] });
        this.checkError(response);
        return response.data.result;
    }

    private checkError(response: AxiosResponse<any>): void {
        let data = response.data.result;
        if (ObjectUtil.hasOwnProperties(data, ['error_message', 'error_code'])) {
            throw new ExtendedError(data.error_message, data.error_code);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getLedgerNumber(): Promise<number> {
        let response = await this.call('ledger', { ledger_index: 'validated' });

        let item = response.ledger as IRippleLedger;
        RippleApi.parseLedger(item);
        return item.ledger_index;
    }

    public async getLedger(ledger: number | string, isNeedTransactions?: boolean): Promise<IRippleLedger> {
        let params = { transactions: isNeedTransactions, expand: isNeedTransactions } as any;
        params[`${_.isNumber(ledger) ? 'ledger_index' : 'ledger_hash'}`] = ledger;

        let response = await this.call('ledger', params);
        let item = response.ledger as IRippleLedger;
        RippleApi.parseLedger(item);
        return item;
    }

    public async getTransaction(transaction: string): Promise<IRippleTransaction> {
        let response = await this.client.post(``, { method: '', params: [] });
        this.checkError(response);

        let item = await this.call<IRippleTransaction>('tx', { transaction, binary: false });
        RippleApi.parseTransaction(item);
        return item;
    }

    /*
    public async getBalance(address: string): Promise<IBtcApiBalanceInsight> {
        let item = await this.client.get<IBtcApiBalanceInsight>(`address/${address}/balance`);
        return item.data;
    }
    */
}

export interface IRippleApiSettings {
    endpoint: string;
}
