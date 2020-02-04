import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'; // development only
import * as fetch from 'node-fetch';
// import { TextDecoder, TextEncoder } from 'text-encoding';
import { TextDecoder, TextEncoder } from 'util';

export class EosApi {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private api: Api;
    private signature: JsSignatureProvider;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(settings: IEosApiSettings) {
        this.signature = new JsSignatureProvider(settings.privateKeys || []);

        this.api = new Api({
            rpc: new JsonRpc(settings.endpoint, { fetch }),
            chainId: settings.chainId,
            textEncoder: new TextEncoder(),
            textDecoder: new TextDecoder(),
            signatureProvider: this.signature
        });
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async transact(transaction: any, options?: IEosApiTransactionOptions): Promise<any> {
        return this.api.transact(transaction, options);
    }

    public async getAccountInfo(name: string): Promise<any> {
        return this.api.rpc.get_account(name);
    }

    public async getCurrencyBalance(code: string, account: string, symbol?: string): Promise<any> {
        return this.api.rpc.get_currency_balance(code, account, symbol);
    }

    public getApi(): Api {
        return this.api;
    }
}

export interface IEosApiTransactionOptions {
    broadcast?: boolean;
    sign?: boolean;
    blocksBehind?: number;
    expireSeconds?: number;
}

export interface IEosApiSettings {
    endpoint: string;
    chainId?: string;
    privateKeys?: Array<string>;
}
