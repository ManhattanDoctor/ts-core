import { EthApi, EthApiDefaultBlock, IEthApiSettings, IEthBlock, IEthEvent } from '../eth';

export class Erc20Api {
    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _client: EthApi;
    protected contract: any;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IErc20ApiSettings) {
        this._client = new EthApi(settings);
        this.contract = this.client.contractCreate(settings.contractAbi, settings.contractAddress);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getEvents(name: string, block: number | EthApiDefaultBlock, filter?: any): Promise<Array<IEthEvent>> {
        return this.contract.getPastEvents(name, { fromBlock: block, toBlock: block, filter });
    }

    public async getBalance(address: string): Promise<string> {
        return this.client.contractCall<string>(this.contract, 'balanceOf', [address]);
    }

    public async getTransferGasLimit(receiver: string, sender: string, amount: string): Promise<string> {
        return this.contract.methods.transfer(receiver, amount).estimateGas({ sender });
    }

    public async getTransferData(receiver: string, amount: string): Promise<string> {
        return this.contract.methods.transfer(receiver, amount).encodeABI();
    }


    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get client(): EthApi {
        return this._client;
    }
}

export interface IErc20ApiSettings extends IEthApiSettings {
    contractAbi: any;
    contractAddress: string;
}
