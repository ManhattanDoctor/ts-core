export interface IXrpTransaction {
    Account: string;
    Fee: string;
    Flags: number;
    LastLedgerSequence: number;
    OfferSequence: number;
    Sequence: number;
    SigningPubKey: string;
    TakerGets: any;
    TakerPays: string;
    TransactionType: XrpTransactionType;
    TxnSignature: string;
    hash: string;
    metaData: any;
    Destination?: string;
    DestinationTag?: number;
    Memos?: Array<IXrpTransactionMemo>;
    Amount?: IXrpTransactionPaymentAmount | string;
}

export interface IXrpTransactionReceipt {
    status: string;

    engine_result?: string;
    engine_result_code?: number;
    engine_result_message?: string;

    tx_json?: IXrpTransaction;

    error?: string;
    error_exception?: string;
}

export class IXrpTransactionMemo {
    Memo: {
        MemoData: string;
        MemoType: XrpTransactionMemoType;
        MemoFormat: XrpTransactionMemoFormat;
    };
}

export enum XrpTransactionType {
    PAYMENT = 'Payment',
    TRUST_SET = 'TrustSet',
    OFFER_CREATE = 'OfferCreate',
    OFFER_CANCEL = 'OfferCancel',
    ACCOUNT_SET = 'AccountSet',
    SET_REGULAR_KEY = 'SetRegularKey',
    SIGNER_LIST_SET = 'SignerListSet',
    ESCROW_CREATE = 'EscrowCreate',
    ESCROW_FINISH = 'EscrowFinish',
    ESCROW_CANCEL = 'EscrowCancel',
    PAYMENT_CHANNEL_CREATE = 'PaymentChannelCreate',
    PAYMENT_CHANNEL_FUND = 'PaymentChannelFund',
    PAYMENT_CHANNEL_CLAIM = 'PaymentChannelClaim',
    PAYMENT_CHANNEL_PREAUTH = 'DepositPreauth'
}

export enum XrpTransactionMemoType {
    MEMO = 'Memo',
    CLIENT = 'client'
}
export enum XrpTransactionMemoFormat {
    TEXT = 'plain/text'
}

export class IXrpTransactionPaymentAmount {
    value: string;
    issuer: string;
    currency: string;
}
