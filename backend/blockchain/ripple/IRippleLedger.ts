import { IRippleTransaction } from './IRippleTransaction';

export interface IRippleLedger {
    number: number;
    createdDate: Date;
    transactions: Array<IRippleTransaction>;

    account_hash: string;
    close_flags: number;
    close_time: number;
    close_time_resolution: number;
    ledger_hash: string;
    ledger_index: number;
    parent_close_time: number;
    parent_hash: string;
    total_coins: string;
    transaction_hash: string;
    tx_count: string;
    close_time_human: string;
    accepted: true;
    closed: boolean;
    hash: string;
}
