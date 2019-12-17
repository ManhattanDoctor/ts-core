import { ExtendedError } from '@ts-core/common/error';
import { DateUtil, ObjectUtil } from '@ts-core/common/util';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as _ from 'lodash';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { IXrpAccountRoot } from './IXrpAccountRoot';
import { IXrpLedger } from './IXrpLedger';
import { IXrpTransaction, IXrpTransactionReceipt } from './IXrpTransaction';

export class XrpApi extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    private static XRP_EPOCH_SINCE_UNIX_TIME = 946684800;

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseLedger(item: IXrpLedger): void {
        if (_.isNil(item)) {
            return;
        }

        item.number = parseInt(item.ledger_index.toString(), 10);
        item.createdDate = new Date((XrpApi.XRP_EPOCH_SINCE_UNIX_TIME + item.close_time) * DateUtil.MILISECONDS_SECOND);

        if (!_.isEmpty(item.transactions)) {
            item.transactions.forEach(XrpApi.parseTransaction);
        }
    }

    public static parseTransaction(item: IXrpTransaction): void {
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
    private clientHistory: AxiosInstance;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IXrpApiSettings, logger?: ILogger) {
        super(logger);
        this.client = axios.create({ baseURL: settings.endpoint });
        if (!_.isNil(settings.endpointHistory)) {
            this.clientHistory = axios.create({ baseURL: settings.endpointHistory });
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private async callApi<T = any>(client: AxiosInstance, methodName: string, params?: any): Promise<T> {
        if (_.isNil(params)) {
            params = {};
        }
        let response = await client.post(``, { method: methodName, params: [params] });
        this.checkError(response);
        return response.data.result;
    }

    private async call<T = any>(methodName: string, params?: any): Promise<T> {
        try {
            return this.callApi(this.client, methodName, params);
        } catch (error) {
            console.log(error);
            if (!_.isNil(this.clientHistory)) {
                return this.callApi(this.clientHistory, methodName, params);
            }
            throw error;
        }
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

    public async sendSignedTransaction(data: string): Promise<IXrpTransactionReceipt> {
        let response = await this.call('submit', { tx_blob: data });
        let item = response as IXrpTransactionReceipt;
        return item;
    }

    public async getLedgerNumber(): Promise<number> {
        let response = await this.call('ledger', { ledger_index: 'validated' });

        let item = response.ledger as IXrpLedger;
        XrpApi.parseLedger(item);
        return item.ledger_index;
    }

    public async getLedger(ledger: number | string, isNeedTransactions?: boolean): Promise<IXrpLedger> {
        let params = { transactions: isNeedTransactions, expand: isNeedTransactions } as any;
        params[`${_.isNumber(ledger) ? 'ledger_index' : 'ledger_hash'}`] = ledger;

        let response = await this.call('ledger', params);
        let item = response.ledger as IXrpLedger;
        XrpApi.parseLedger(item);
        return item;
    }

    public async getTransaction(transaction: string): Promise<IXrpTransaction> {
        let response = await this.client.post(``, { method: '', params: [] });
        this.checkError(response);

        let item = await this.call<IXrpTransaction>('tx', { transaction, binary: false });
        XrpApi.parseTransaction(item);
        return item;
    }

    public async getBalance(account: string): Promise<string> {
        let response = await this.call('account_info', { account, ledger_index: 'validated', strict: true });

        let item = response.account_data as IXrpAccountRoot;
        return item.Balance;
    }
}

export interface IXrpApiSettings {
    endpoint: string;
    endpointHistory?: string;
}
