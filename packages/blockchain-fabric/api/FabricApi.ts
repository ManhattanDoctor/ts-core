import { PromiseHandler } from '@ts-core/common/promise';
import { Network, Contract, Wallet, Gateway, InMemoryWallet, X509WalletMixin } from 'fabric-network';
import Client, { Channel, Block } from 'fabric-client';
import * as _ from 'lodash';
import { ExtendedError } from '@ts-core/common/error';
import { ObservableData } from '@ts-core/common/observer';
import { Subject } from 'rxjs';
import { LoadableEvent } from '@ts-core/common/Loadable';
import { IFabricChannelInfo } from './IFabricChannelInfo';
import { LoggerWrapper, ILogger } from '@ts-core/common/logger';
import { IFabricBlock } from './IFabricBlock';
import { IFabricTransaction } from './IFabricTransaction';

export class FabricApi extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseBlock(block: Block): void {
        let item: IFabricBlock = block as any;
        item.hash = block.header.data_hash.toString('hex');
        item.number = Number(block.header.number);
        item.createdDate = FabricApi.getBlockCreatedDate(block);
    }

    public static getBlockCreatedDate(block: Block): Date {
        if (_.isNil(block.data) || _.isEmpty(block.data.data)) {
            return null;
        }
        for (let data of block.data.data) {
            if (_.isNil(data) || _.isNil(data.payload) || _.isNil(data.payload.header) || _.isNil(data.payload.header.channel_header)) {
                continue;
            }
            return new Date(data.payload.header.channel_header.timestamp);
        }
        return null;
    }

    public static async createWallet(settings: IFabricApiSettings): Promise<Wallet> {
        let item = new InMemoryWallet();
        await item.import(
            settings.fabricIdentity,
            X509WalletMixin.createIdentity(settings.fabricIdentityMspId, settings.fabricIdentityCertificate, settings.fabricIdentityPrivateKey)
        );
        if (!_.isNil(settings.fabricTlsIdentity)) {
            await item.import(
                settings.fabricTlsIdentity,
                X509WalletMixin.createIdentity(settings.fabricTlsIdentityMspId, settings.fabricTlsIdentityCertificate, settings.fabricTlsIdentityPrivateKey)
            );
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected observer: Subject<ObservableData<LoadableEvent, any>>;
    protected connectionPromise: PromiseHandler<void, ExtendedError>;

    protected _network: Network;
    protected _channel: Channel;
    protected _contract: Contract;

    protected _wallet: Wallet;
    protected _gateway: Gateway;
    protected _isConnected: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected settings: IFabricApiSettings) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Connect
    //
    // --------------------------------------------------------------------------

    public async connect(): Promise<void> {
        if (_.isNil(this.settings)) {
            throw new ExtendedError(`Unable to connect: settings is nil`);
        }
        if (this.connectionPromise) {
            return this.connectionPromise.promise;
        }
        this.connectionPromise = PromiseHandler.create();
        this.reconnect();
        return this.connectionPromise.promise;
    }

    public disconnect(error?: ExtendedError): void {
        if (this.connectionPromise) {
            this.connectionPromise.reject(error);
            this.connectionPromise = null;
        }

        this.gateway = null;
        this._isConnected = false;
    }

    public destroy(): void {
        super.destroy();
        this.disconnect();

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
    }

    protected async reconnect(): Promise<void> {
        this.debug(`Connecting to Fabric "${this.settings.fabricIdentity}:${this.settings.fabricNetworkName}:${this.settings.fabricChaincodeName}"`);

        let client = new Client();
        try {
            this.gateway = new Gateway();
            await this.gateway.connect(this.settings.fabricConnectionSettingsPath, {
                wallet: await this.getWallet(),
                identity: this.settings.fabricIdentity,
                clientTlsIdentity: this.settings.fabricTlsIdentity,
                discovery: { enabled: this.settings.fabricIsDiscoveryEnabled, asLocalhost: true }
            });

            this._network = await this.gateway.getNetwork(this.settings.fabricNetworkName);
            this._channel = this.network.getChannel();
            this._contract = this.network.getContract(this.settings.fabricChaincodeName);
            this.connectionConnectCompleteHandler();
        } catch (error) {
            this.connectionConnectErrorHandler(ExtendedError.create(error, ExtendedError.DEFAULT_ERROR_CODE));
        }
    }

    protected async getWallet(): Promise<Wallet> {
        if (_.isNil(this._wallet)) {
            this._wallet = await FabricApi.createWallet(this.settings);
        }
        return this._wallet;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected connectionConnectCompleteHandler = (): void => {
        this._isConnected = true;
        if (this.connectionPromise) {
            this.connectionPromise.resolve();
        }
    };

    protected connectionConnectErrorHandler = (error: ExtendedError): void => {
        this.disconnect(error);
    };

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getInfo(channel?: Channel): Promise<IFabricChannelInfo> {
        if (_.isNil(channel)) {
            channel = this.channel;
        }

        let item = await channel.queryInfo();
        return {
            height: item.height.toNumber(),
            currentBlockHash: item.currentBlockHash.toString('hex'),
            previousBlockHash: item.previousBlockHash.toString('hex')
        };
    }

    public async getBlockNumber(channel?: Channel): Promise<number> {
        let info = await this.getInfo(channel);
        return info.height;
    }

    public async getBlock(block: number | string, channel?: Channel): Promise<IFabricBlock> {
        if (_.isNil(channel)) {
            channel = this.channel;
        }

        let item: Block = null;
        if (_.isString(block)) {
            item = await channel.queryBlockByHash(Buffer.from(block, 'hex'));
        } else if (_.isNumber(block)) {
            item = await channel.queryBlock(block);
        } else {
            throw new ExtendedError(`Invalid block: value must be string or number`);
        }
        FabricApi.parseBlock(item);
        return item as IFabricBlock;
    }

    public async getBlockByTxID(id: string, channel?: Channel): Promise<IFabricBlock> {
        if (_.isNil(channel)) {
            channel = this.channel;
        }
        let item = await channel.queryBlockByTxID(id);
        FabricApi.parseBlock(item);
        return item as IFabricBlock;
    }

    public async getTransaction(id: string, channel?: Channel): Promise<IFabricTransaction> {
        if (_.isNil(channel)) {
            channel = this.channel;
        }
        return channel.queryTransaction(id);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isConnected(): boolean {
        return this._isConnected;
    }

    public get network(): Network {
        return this._network;
    }

    public get channel(): Channel {
        return this._channel;
    }

    public get contract(): Contract {
        return this._contract;
    }

    public get gateway(): Gateway {
        return this._gateway;
    }

    public set gateway(value: Gateway) {
        if (value === this._gateway) {
            return;
        }

        if (this._gateway) {
            this._network = null;
            this._channel = null;
            this._contract = null;
            this._gateway.disconnect();
        }
        this._gateway = value;
    }
}

export interface IFabricApiSettings {
    fabricNetworkName: string;
    fabricChaincodeName: string;
    fabricIsDiscoveryEnabled: boolean;
    fabricConnectionSettingsPath: string;

    fabricIdentity: string;
    fabricIdentityMspId: string;
    fabricIdentityPrivateKey: string;
    fabricIdentityCertificate: string;

    fabricTlsIdentity?: string;
    fabricTlsIdentityMspId?: string;
    fabricTlsIdentityPrivateKey?: string;
    fabricTlsIdentityCertificate?: string;
}
