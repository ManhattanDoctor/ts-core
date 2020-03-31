import { Block } from 'fabric-client';

export interface IFabricBlock extends Block {
    hash: string;
    number: number;
    createdDate: Date;
}
