import { IBtcTransaction } from './IBtcTransaction';

export interface IBtcInput extends IBtcInputBitcore {
    tx: IBtcTransaction;
}

interface IBtcInputBitcore {
    txid: string;
    vout: number;
    sequence: number;
    coinbase: string;
    scriptSig: {
        asm: string;
        hex: string;
    };
}
