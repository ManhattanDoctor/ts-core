import { BlockTransactionObject } from 'web3-eth';

export interface IEthBlock extends IEthBlockGeth {
    number: number;
    createdDate: Date;
}

export interface IEthBlockGeth extends BlockTransactionObject {}
