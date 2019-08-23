import { IBtcInput } from './IBtcInput';
import { IBtcOutput } from './IBtcOutput';

export interface IBtcTransaction extends IBtcTransactionBitcore {}

interface IBtcTransactionBitcore {
    txid: string;
    hash: string;
    hex: string;
    version: number;
    size: number;
    vsize: number;
    weight: number;
    locktime: number;
    vin: Array<IBtcInput>;
    vout: Array<IBtcOutput>;
}
