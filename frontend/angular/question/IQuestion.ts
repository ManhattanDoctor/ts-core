export interface IQuestion {
    readonly mode: QuestionMode;
    readonly isChecked: boolean;

    readonly text: string;
    readonly notText: string;
    readonly yesText: string;
    readonly closeText: string;
    readonly checkText: string;

    readonly closePromise: Promise<void>;
    readonly yesNotPromise: Promise<void>;
}

export interface IQuestionOptions {
    text?: string;
    mode?: QuestionMode;
    isChecked?: boolean;
    yesTextId?: string;
    notTextId?: string;
    checkTextId?: string;
    closeTextId?: string;
}

export enum QuestionMode {
    INFO = 'INFO',
    QUESTION = 'QUESTION'
}

export enum QuestionEvent {
    YES = 'YES',
    NOT = 'NOT',
    CLOSE = 'CLOSE',
    CHECK = 'CHECK',
    UNCHECK = 'UNCHECK'
}
