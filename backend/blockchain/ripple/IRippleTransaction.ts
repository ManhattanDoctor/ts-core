export interface IRippleTransaction {
    Account: string;
    Fee: string;
    Flags: number;
    LastLedgerSequence: number;
    OfferSequence: number;
    Sequence: number;
    SigningPubKey: string;
    TakerGets: any;
    TakerPays: string;
    TransactionType: RippleTransactionType;
    TxnSignature: string;
    hash: string;
    metaData: any;

    Destination?: string;
    Amount?: IRippleTransactionPaymentAmount | string;
}

export class IRippleTransactionPaymentAmount {
    currency: string;
    value: string;
    issuer: string;
}

export enum RippleTransactionType {
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
