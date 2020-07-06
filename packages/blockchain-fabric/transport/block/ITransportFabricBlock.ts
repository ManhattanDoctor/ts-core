import { ITransportFabricTransaction } from './ITransportFabricTransaction';
import { ITransportFabricEvent } from '../block';

export interface ITransportFabricBlock {
    hash: string;
    number: number;
    createdDate: Date;
    events: Array<ITransportFabricEvent>;
    transactions: Array<ITransportFabricTransaction>;
}
