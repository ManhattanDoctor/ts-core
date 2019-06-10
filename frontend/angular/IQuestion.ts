import { Observable } from 'rxjs';

export interface IQuestion {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    mode: QuestionMode;
    isChecked: boolean;

    text: string;
    notTextId: string;
    yesTextId: string;
    closeTextId: string;
    checkTextId: string;

    readonly events: Observable<string>;
    readonly closePromise: Promise<void>;
    readonly yesNotPromise: Promise<void>;

    close(): void;
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
