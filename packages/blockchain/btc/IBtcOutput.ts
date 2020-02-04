export interface IBtcOutput extends IBtcOutputBitcore {
    type: BtcOutputType;
    address?: string;
    addresses?: Array<string>;
}

interface IBtcOutputBitcore {
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

export enum BtcOutputType {
    MULTI_SIGN = 'multisig',
    PUB_KEY = 'pubkey',
    PUB_KEY_HASH = 'pubkeyhash',
    SCRIPT_HASH = 'scripthash',
    WITNESS_V0_KEY_HASH = 'witness_v0_keyhash',
    WITNESS_V0_SCRIPT_HASH = 'witness_v0_scripthash',
    NULL_DATA = 'nulldata',
    NON_STANDART = 'nonstandard'
}
