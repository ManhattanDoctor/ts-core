import { Loadable, LoadableEvent, LoadableStatus } from '../Loadable';
import { ObservableData } from '../observer';
import { ArrayUtil } from '../util';

export abstract class SequienceExecutor<U, V> extends Loadable<LoadableEvent, SequienceExecutorData<U, V>> {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected inputs: Array<U>;
    protected isDestroyed: boolean;
    protected delayTimeout: number = 1000;

    private _progress: number = NaN;
    private _totalLength: number = NaN;
    private _currentIndex: number = NaN;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.inputs = [];
    }

    // --------------------------------------------------------------------------
    //
    //	Event Handlers
    //
    // --------------------------------------------------------------------------

    protected finishedInput(input: U): void {
        if (this.isDestroyed) {
            return;
        }
        let index = this.inputs.indexOf(input);
        this.inputs.splice(index, 1);

        if (this.inputs.length == 0) {
            this.makeFinished();
            return;
        }

        this.nextIndex();
        this.nextInput();
    }

    protected skipInput(input: U): void {
        if (this.isDestroyed) {
            return;
        }
        this.nextIndex();
        this.nextInput();
    }

    protected checkProgress(): void {
        let value = (100 * this.currentIndex) / this.totalLength;
        if (value == this._progress || isNaN(value) || !isFinite(value)) {
            return;
        }
        this._progress = value;
    }

    protected makeStarted(): void {
        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));

        this.currentIndex = 0;
        this.nextInput();
    }

    protected makeFinished(): void {
        this.totalLength = 0;
        this.currentIndex = 0;
        this.status = LoadableStatus.LOADED;

        ArrayUtil.clear(this.inputs);
        this.observer.next(new ObservableData(LoadableEvent.FINISHED));
    }

    protected delay(timeout: number = NaN): Promise<void> {
        let delay: number = isNaN(timeout) ? this.delayTimeout : timeout;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected nextIndex(): void {
        let index = this.currentIndex + 1;
        if (index > this.inputs.length - 1) {
            index = 0;
        }
        this.currentIndex = index;
    }

    protected nextInput(): void {
        let input = this.inputs[this.currentIndex];
        this.executeInput(input).then(
            data => {
                this.observer.next(new ObservableData(LoadableEvent.COMPLETE, { input: input, output: data }));
                this.finishedInput(input);
            },
            error => {
                if (error === SequienceExecutorError.SKIP) {
                    this.skipInput(input);
                } else {
                    this.observer.next(new ObservableData(LoadableEvent.ERROR, { input: input, error: error }));
                    this.finishedInput(input);
                }
            }
        );
    }

    protected addInput(input: U): void {
        if (this.inputs.includes(input)) {
            return;
        }
        this.inputs.push(input);
        if (this.inputs.length > 0 && !this.isLoading) {
            this.makeStarted();
        }
    }

    protected abstract async executeInput(value: U): Promise<V>;

    // --------------------------------------------------------------------------
    //
    //	Private Properties
    //
    // --------------------------------------------------------------------------

    private get currentIndex(): number {
        return this._currentIndex;
    }
    private set currentIndex(value: number) {
        if (value == this._currentIndex) {
            return;
        }
        this._currentIndex = value;
        this.checkProgress();
    }

    private get totalLength(): number {
        return this._totalLength;
    }
    private set totalLength(value: number) {
        if (value == this._totalLength) {
            return;
        }
        this._totalLength = value;
        this.checkProgress();
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public start(inputs: Array<U>): void {
        if (this.isLoading) {
            return;
        }
        this.currentIndex = 0;
        this.totalLength = inputs.length;
        for (let input of inputs) {
            this.addInput(input);
        }
    }

    public stop(): void {
        if (this.isLoading) {
            this.makeFinished();
        }
    }

    public destroy(): void {
        this.inputs = null;
        this.observer = null;
        this.isDestroyed = true;

        this._totalLength = NaN;
        this._currentIndex = NaN;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get progress(): number {
        return this._progress;
    }
}

export enum SequienceExecutorError {
    SKIP = 'SKIP'
}
export interface SequienceExecutorData<U, V> {
    input: U;
    output?: V;
    error?: Error;
}
