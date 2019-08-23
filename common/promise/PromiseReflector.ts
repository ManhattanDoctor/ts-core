import { IDestroyable } from '../IDestroyable';

export class PromiseReflector<U = any, V = string> implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<U = any, V = string>(promise: Promise<U>): Promise<PromiseReflector<U, V>> {
        return promise.then(
            value => {
                return new PromiseReflector<U, V>(promise, PromiseStatus.COMPLETE, value);
            },
            error => {
                return new PromiseReflector<U, V>(promise, PromiseStatus.ERROR, null, error);
            }
        );
    }

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private _promise: Promise<U>, private _status: PromiseStatus, private _value?: U, private _error?: V) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        this._value = null;
        this._error = null;
        this._status = null;
        this._promise = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get value(): U {
        return this._value;
    }

    public get error(): V {
        return this._error;
    }

    public get promise(): Promise<U> {
        return this._promise;
    }

    public get status(): PromiseStatus {
        return this._status;
    }

    public get isError(): boolean {
        return this._status === PromiseStatus.ERROR;
    }

    public get isComplete(): boolean {
        return this._status === PromiseStatus.COMPLETE;
    }
}

export enum PromiseStatus {
    ERROR = 'ERROR',
    COMPLETE = 'COMPLETE'
}
