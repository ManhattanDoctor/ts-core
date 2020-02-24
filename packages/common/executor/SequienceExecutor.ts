import * as _ from 'lodash';
import { Loadable, LoadableEvent, LoadableStatus } from '../Loadable';
import { ObservableData } from '../observer';
import { PromiseHandler } from '../promise';
import { ArrayUtil } from '../util';

export abstract class SequienceExecutor<U, V> extends Loadable<LoadableEvent, SequienceExecutorData<U, V>> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public timeout: number = NaN;
    protected timeoutTimer: any;

    protected inputs: Array<U>;
    protected isDestroyed: boolean;

    private index: number = NaN;

    private _promise: PromiseHandler<void>;
    private _progress: number = NaN;
    private _totalIndex: number = NaN;
    private _totalLength: number = NaN;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.inputs = [];
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected finishedInput(input: U): void {
        if (this.isDestroyed) {
            return;
        }
        let index = this.inputs.indexOf(input);
        this.inputs.splice(index, 1);

        if (this.inputs.length === 0) {
            this.makeFinished();
            return;
        }

        this.totalIndex++;
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
        let value = (100 * this.totalIndex) / this.totalLength;
        if (value === this._progress || _.isNaN(value) || !_.isFinite(value)) {
            return;
        }
        this._progress = value;
    }

    protected makeStarted(): void {
        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));

        clearTimeout(this.timeoutTimer);
        if (!_.isNaN(this.timeout) && this.timeout > 0) {
            this.timeoutTimer = setTimeout(() => this.timeoutExired(), this.timeout);
        }

        this.index = 0;
        this.nextInput();
    }

    protected makeFinished(error?: string): void {
        this.index = 0;
        this.totalIndex = 0;
        this.totalLength = 0;
        this.status = LoadableStatus.LOADED;

        ArrayUtil.clear(this.inputs);
        clearTimeout(this.timeoutTimer);
        this.observer.next(new ObservableData(LoadableEvent.FINISHED));

        if (!this.promise) {
            return;
        }

        if (error) {
            this.promise.reject(error);
        } else {
            this.promise.resolve();
        }
        this.promise = null;
    }

    protected timeoutExired(): void {
        this.makeFinished(`Timeout error`);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected nextIndex(): void {
        this.index++;
        if (this.index > this.inputs.length - 1) {
            this.index = 0;
        }
    }

    protected nextInput(): void {
        let input = this.inputs[this.index];
        this.executeInput(input).then(
            data => {
                this.observer.next(new ObservableData(LoadableEvent.COMPLETE, { input, output: data }));
                this.finishedInput(input);
            },
            error => {
                if (error === SequienceExecutorError.SKIP) {
                    this.skipInput(input);
                } else {
                    this.observer.next(new ObservableData(LoadableEvent.ERROR, { input, error }));
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
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    protected get totalIndex(): number {
        return this._totalIndex;
    }
    protected set totalIndex(value: number) {
        if (value === this._totalIndex) {
            return;
        }
        this._totalIndex = value;
        this.checkProgress();
    }

    protected get totalLength(): number {
        return this._totalLength;
    }
    protected set totalLength(value: number) {
        if (value === this._totalLength) {
            return;
        }
        this._totalLength = value;
        this.checkProgress();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public start(inputs: Array<U>): Promise<void> {
        if (this.isLoading) {
            return this.promise.promise;
        }

        this.promise = PromiseHandler.create();

        this.index = 0;
        this.totalIndex = 0;
        this.totalLength = inputs.length;
        for (let input of inputs) {
            this.addInput(input);
        }

        return this.promise.promise;
    }

    public stop(): void {
        if (this.isLoading) {
            this.makeFinished(`SequienceExecutor manually stopped`);
        }
    }

    public destroy(): void {
        this.stop();
        clearTimeout(this.timeoutTimer);

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }

        this.inputs = null;
        this.isDestroyed = true;

        this.index = NaN;
        this._totalIndex = NaN;
        this._totalLength = NaN;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private get promise(): PromiseHandler<void> {
        return this._promise;
    }
    private set promise(value: PromiseHandler<void>) {
        if (value === this._promise) {
            return;
        }
        if (this._promise) {
            this._promise.reject();
        }
        this._promise = value;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
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
