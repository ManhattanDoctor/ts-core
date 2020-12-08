import * as _ from 'lodash';
import { PromiseHandler } from '@ts-core/common/promise';
import { Destroyable } from '@ts-core/common';
import { IQuestion, IQuestionOptions, QuestionMode } from './IQuestion';

export class QuestionManager extends Destroyable implements IQuestion {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public text: string;
    public mode: QuestionMode;
    public options: IQuestionOptions;

    public notText: string;
    public yesText: string;
    public closeText: string;
    public checkText: string;

    protected _isChecked: boolean = false;

    protected _closePromise: PromiseHandler<void, void>;
    protected _yesNotPromise: PromiseHandler<void, void>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(options?: IQuestionOptions) {
        super();
        this._closePromise = PromiseHandler.create();
        this._yesNotPromise = PromiseHandler.create();

        this.yesText = 'Yes';
        this.notText = 'Not';
        this.closeText = 'Close';
        this.checkText = 'Check';
        this.options = _.assign(
            {
                mode: QuestionMode.INFO,
                isChecked: false,
                yesTextId: 'general.yes',
                notTextId: 'general.not',
                closeTextId: 'general.close'
            },
            options
        );
        this.text = this.options.text;
        this.mode = this.options.mode;
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    public closeClickHandler(): void {
        this._closePromise.resolve();
    }

    public yesClickHandler(): void {
        this._yesNotPromise.resolve();
        this.closeClickHandler();
    }

    public notClickHandler(): void {
        this._yesNotPromise.reject();
        this.closeClickHandler();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }

        this.notClickHandler();
        this._yesNotPromise = null;
        this._closePromise = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Interface Properties
    //
    // --------------------------------------------------------------------------

    public get yesNotPromise(): Promise<void> {
        return this._yesNotPromise.promise;
    }

    public get closePromise(): Promise<void> {
        return this._closePromise.promise;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isInfo(): boolean {
        return this.mode === QuestionMode.INFO;
    }

    public get isQuestion(): boolean {
        return this.mode === QuestionMode.QUESTION;
    }

    public get isChecked(): boolean {
        return this._isChecked;
    }
    public set isChecked(value: boolean) {
        if (value === this._isChecked) {
            return;
        }
        this._isChecked = value;
        // this.content.emit(value ? QuestionEvent.CHECK : QuestionEvent.UNCHECK);
    }
}
