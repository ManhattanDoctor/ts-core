import { ViewContainerRef } from '@angular/core';
import { IQuestion, QuestionMode } from '../../question';
import { QuestionManager } from '../../question/QuestionManager';
import { IWindowContent } from '../IWindowContent';

export abstract class WindowQuestionBaseComponent extends IWindowContent implements IQuestion {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    protected question: QuestionManager;

    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor(container: ViewContainerRef) {
        super(container);
        this.question = this.addDestroyable(this.createQuestionManager());
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected createQuestionManager(): QuestionManager {
        return new QuestionManager(this);
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public initialize(options: QuestionManager): void {
        this.question.initialize(options);
    }

    //--------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    //--------------------------------------------------------------------------

    public closeClickHandler(): void {
        this.question.closeClickHandler();
        this.close();
    }

    public yesClickHandler(): void {
        this.question.yesClickHandler();
        this.close();
    }

    public notClickHandler(): void {
        this.question.notClickHandler();
        this.close();
    }

    //--------------------------------------------------------------------------
    //
    //  Public Properties
    //
    //--------------------------------------------------------------------------

    public get isInfo(): boolean {
        return this.mode === QuestionMode.INFO;
    }

    public get isQuestion(): boolean {
        return this.mode === QuestionMode.QUESTION;
    }

    //--------------------------------------------------------------------------
    //
    //  Public Question Methods
    //
    //--------------------------------------------------------------------------

    public get yesText(): string {
        return this.question.yesText;
    }
    public get notText(): string {
        return this.question.notText;
    }
    public get closeText(): string {
        return this.question.closeText;
    }
    public get checkText(): string {
        return this.question.checkText;
    }
    public get text(): string {
        return this.question.text;
    }
    public get yesNotPromise(): Promise<void> {
        return this.question.yesNotPromise;
    }
    public get closePromise(): Promise<void> {
        return this.question.closePromise;
    }
    public get mode(): QuestionMode {
        return this.question.mode;
    }
    public get isChecked(): boolean {
        return this.question.isChecked;
    }
    public set isChecked(value: boolean) {
        this.question.isChecked = value;
    }
}
