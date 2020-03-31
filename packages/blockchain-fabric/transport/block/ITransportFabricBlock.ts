import { ITransportFabricEvent } from './ITransportFabricEvent';
import { ITransportFabricTransaction } from './ITransportFabricTransaction';

export interface ITransportFabricBlock {
    hash: string;
    number: number;
    createdDate: Date;
    events: Array<ITransportFabricEvent>;
    transactions: Array<ITransportFabricTransaction>;
}
