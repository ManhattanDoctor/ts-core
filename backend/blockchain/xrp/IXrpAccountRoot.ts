export interface IXrpAccountRoot {
    Account: string;
    AccountTxnID: string;
    Balance: string;
    Domain: string;
    EmailHash: string;
    Flags: number;
    LedgerEntryType: string;
    MessageKey: string;
    OwnerCount: number;
    PreviousTxnID: string;
    PreviousTxnLgrSeq: number;
    Sequence: number;
    TransferRate: number;
    index: string;
}
