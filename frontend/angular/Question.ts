import { Observable } from 'rxjs';

export abstract class Question {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public mode: QuestionMode;
    public isChecked: boolean = false;

    public text: string;
    public notTextId: string;
    public yesTextId: string;
    public closeTextId: string;
    public checkTextId: string;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public close(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Interface Methods
    //
    // --------------------------------------------------------------------------

    readonly events: Observable<string>;
    readonly closePromise: Promise<void>;
    readonly yesNotPromise: Promise<void>;
}

export enum QuestionMode {
    INFO = 'INFO',
    QUESTION = 'QUESTION'
}

export enum QuestionEvent {
    EVENT_YES = 'EVENT_YES',
    EVENT_NOT = 'EVENT_NOT',
    EVENT_CLOSE = 'EVENT_CLOSE',
    EVENT_CHECK = 'EVENT_CHECK',
    EVENT_UNCHECK = 'EVENT_UNCHECK'
}
