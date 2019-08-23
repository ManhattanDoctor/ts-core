import * as RpcClient from 'bitcoind-rpc';
import * as _ from 'lodash';
import { ILogger, LoggerWrapper } from '../../../common/logger';
import { PromiseHandler } from '../../../common/promise';
import { ObjectUtil } from '../../../common/util';
import { BtcApiInputsTransactionLoader } from './BtcApiInputsTransactionLoader';
import { IBtcBlock } from './IBtcBlock';
import { IBtcInput } from './IBtcInput';
import { BtcOutputType, IBtcOutput } from './IBtcOutput';
import { IBtcTransaction } from './IBtcTransaction';

export class BtcApi extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseBlock(item: IBtcBlock): void {
        item.number = item.height;
        item.tx.forEach(BtcApi.parseTransaction);
    }

    public static parseTransaction(item: IBtcTransaction): void {
        if (_.isNil(item)) {
            return;
        }

        item.vin.forEach(BtcApi.parseInput);
        item.vout.forEach(BtcApi.parseOutput);
    }

    public static parseInput(item: IBtcInput): void {
        if (_.isNil(item)) {
            return;
        }

        if (!_.isNil(item.coinbase)) {
            return;
        }

        try {
            item.tx.vout.forEach(BtcApi.parseOutput);
        } catch (error) {
            console.log(item);
            console.log(item.tx);
            process.exit(0);
        }

        // BtcApi.parseTransaction(item.tx);
    }

    private static parseOutput(item: IBtcOutput): void {
        if (_.isNil(item.scriptPubKey)) {
            return;
        }

        item.type = item.scriptPubKey.type as BtcOutputType;
        item.addresses = item.scriptPubKey.addresses;

        switch (item.type) {
            case BtcOutputType.PUB_KEY:
            case BtcOutputType.SCRIPT_HASH: // TODO: need to check!
            case BtcOutputType.PUB_KEY_HASH:
                if (_.isEmpty(item.addresses) || item.addresses.length !== 1) {
                    throw new Error(`Transaction ${item.type} ouput has incorrect addresses`);
                }
                item.address = item.addresses[0];
                break;
            case BtcOutputType.NULL_DATA:

            case BtcOutputType.MULTI_SIGN:
            case BtcOutputType.WITNESS_V0_KEY_HASH:
            case BtcOutputType.WITNESS_V0_SCRIPT_HASH:
                break;
            default:
                console.log(item.type);
                console.log(item);
                process.exit(0);
        }
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

    constructor(settings: IBtcApiSettings, logger?: ILogger) {
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

    private async loadInputs(inputs: Array<IBtcInput>): Promise<void> {
        if (_.isEmpty(inputs)) {
            return;
        }
        let loader = new BtcApiInputsTransactionLoader(this);
        return loader.start(_.chunk(inputs, 15));
    }

    private getInputs(item: IBtcBlock | IBtcTransaction): Array<IBtcInput> {
        let items = [];

        if (ObjectUtil.instanceOf(item, ['tx', 'height'])) {
            item = item as IBtcBlock;
            for (let transaction of item.tx) {
                items.push(...this.getInputs(transaction));
            }
        } else {
            item = item as IBtcTransaction;
            for (let input of item.vin) {
                if (!_.isNil(input.txid)) {
                    items.push(input);
                }
            }
        }
        return items;
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

    public async getBlock(block: number, isNeedTransactions?: boolean): Promise<IBtcBlock> {
        let hash = await this.call('getBlockHash', block);
        let item = await this.call<IBtcBlock>('getBlock', hash, isNeedTransactions ? 2 : 0);

        if (isNeedTransactions) {
            // item.tx = item.tx.slice(0, 5);
            this.debug(`Loading transactions for block ${item.height}...`);
            await this.loadInputs(this.getInputs(item));
        }

        // BtcApi.parseBlock(item);
        return item;
    }

    public async getTransaction(transaction: string | IBtcTransaction, isNeedInputs?: boolean): Promise<IBtcTransaction> {
        let item = _.isString(transaction) ? await this.call('getRawTransaction', transaction, 1) : (transaction as IBtcTransaction);
        if (!isNeedInputs || _.isEmpty(item.vin)) {
            return item;
        }
        await this.loadInputs(this.getInputs(item));
        return item;
    }

    public destroy(): void {
        this.client = null;
        this.logger = null;
    }
}

export interface IBtcApiSettings {
    endpoint: string;
}
