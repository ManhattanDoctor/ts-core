import * as RpcClient from 'bitcoind-rpc';
import * as _ from 'lodash';
import { LoadableEvent } from '../../../common';
import { ILogger, LoggerWrapper } from '../../../common/logger';
import { PromiseHandler } from '../../../common/promise';
import { ArrayUtil } from '../../../common/util';
import { BtcApiBitcoreTransactionsLoader } from './BtcApiBitcoreTransactionsLoader';

export class BtcApiBitcore extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static isOutputHasAddresses(item: IBtcTransactionOutputBitcore): boolean {
        return !_.isNil(item.scriptPubKey) && !_.isEmpty(item.scriptPubKey.addresses);
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    private client: RpcClient;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IBtcApiSettingsBitcore, logger?: ILogger) {
        super(logger);
        this.client = new RpcClient(settings.endpoint);
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private call<T = any>(methodName: string, ...params): Promise<T> {
        if (_.isNil(params)) {
            params = [];
        }

        let promise = PromiseHandler.create();
        let method = this.client[methodName];
        params.push((error, data): void => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve(data.result);
            }
        });
        method.apply(this.client, params);
        return promise.promise;
    }

    private async loadBlockTransactions(item: IBtcBlockBitcore): Promise<IBtcBlockBitcore> {
        let inputs = new Map();

        // item.tx = item.tx.slice(0, 10);
        for (let transaction of item.tx) {
            if (_.isEmpty(transaction.vin)) {
                continue;
            }
            for (let input of transaction.vin) {
                if (!_.isNil(input.txid)) {
                    inputs.set(input.txid, input);
                }
            }
        }

        if (inputs.size === 0) {
            return item;
        }

        let chunks = ArrayUtil.chunk(Array.from(inputs.keys()), 15);
        let loader = new BtcApiBitcoreTransactionsLoader(this);
        loader.start(chunks);

        let promise = PromiseHandler.create();
        let subscription = loader.events.subscribe(data => {
            if (data.type === LoadableEvent.COMPLETE) {
                for (let i = 0; i < data.data.input.length; i++) {
                    let input = inputs.get(data.data.input[i]);
                    let value = data.data.output[i];
                    if (value instanceof Error) {
                        this.error(`Getting ${input.txid} transaction for ${item.number} block has error`);
                        promise.reject(value.toString());
                        loader.stop();
                    } else {
                        input.tx = value;
                    }
                }
                this.debug(`${loader.progress.toFixed(2)}% transactions loaded for block ${item.number}`);
            } else if (data.type === LoadableEvent.FINISHED) {
                subscription.unsubscribe();
                loader.destroy();
                promise.resolve(item);
            }
        });

        return promise.promise;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getBlockNumber(): Promise<number> {
        let item = await this.call('getBlockchainInfo');
        return item.blocks;
    }

    public async getTransaction(transaction: string | IBtcTransactionBitcore, isNeedDetails?: boolean): Promise<IBtcTransactionBitcore> {
        let item = _.isString(transaction) ? await this.call('getRawTransaction', transaction, 1) : (transaction as IBtcTransactionBitcore);
        if (!isNeedDetails || _.isEmpty(item.vin)) {
            return item;
        }

        for (let input of item.vin) {
            if (!_.isNil(input.txid)) {
                input.tx = await this.getTransaction(input.txid, false);
            }
        }

        return item;
    }

    public async getBlock(block: number, isNeedTransactions?: boolean): Promise<IBtcBlockBitcore> {
        let hash = await this.call('getBlockHash', block);
        let item = await this.call<IBtcBlockBitcore>('getBlock', hash, isNeedTransactions ? 2 : 0);

        item.number = item.height;
        return isNeedTransactions ? this.loadBlockTransactions(item) : item;
    }

    public destroy(): void {
        this.client = null;
        this.logger = null;
    }
}

export interface IBtcApiSettingsBitcore {
    endpoint: string;
}

export interface IBtcBlockBitcore {
    number: number;

    hash: string;
    confirmations: number;
    strippedsize: number;
    size: number;
    weight: number;
    height: number;
    version: number;
    versionHex: string;
    merkleroot: string;
    time: number;
    mediantime: number;
    nonce: number;
    bits: string;
    difficulty: number;
    chainwork: string;
    nTx: number;
    previousblockhash: string;
    nextblockhash: string;
    tx: Array<IBtcTransactionBitcore>;
}

export interface IBtcTransactionBitcore {
    txid: string;
    hash: string;
    hex: string;
    version: number;
    size: number;
    vsize: number;
    weight: number;
    locktime: number;
    vin: Array<IBtcTransactionInputBitcore>;
    vout: Array<IBtcTransactionOutputBitcore>;
}

export interface IBtcTransactionInputBitcore {
    tx?: IBtcTransactionBitcore;

    txid: string;
    vout: number;
    sequence: number;
    coinbase?: string;
    scriptSig: {
        asm: string;
        hex: string;
    };
}

export interface IBtcTransactionOutputBitcore {
    value: number;
    n: number;
    scriptPubKey: {
        asm: string;
        hex: string;
        reqSigs: number;
        type: string;
        addresses: Array<string>;
    };
}
