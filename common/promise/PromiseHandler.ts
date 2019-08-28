import { IDestroyable } from '../IDestroyable';

export class PromiseHandler<U = any, V = string> implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<U = any, V = string>(): PromiseHandler<U, V> {
        let item = new PromiseHandler<U, V>();
        item.promise = new Promise<U>((resolve, reject) => {
            item.initialize(resolve, reject);
        });
        return item;
    }

    public static delay(timeout: number): Promise<void> {
        let promise = PromiseHandler.create();
        let timer = setTimeout(() => {
            clearTimeout(timer);
            promise.resolve();
        }, timeout);
        return promise.promise;
    }

    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public promise: Promise<U>;

    private status: PromiseHandlerStatus;
    private rejectFunction: (item?: V) => void;
    private resolveFunction: (item?: U) => void;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        this.status = PromiseHandlerStatus.PENDING;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public initialize(resolve: (item?: U) => void, reject: (item?: V) => void) {
        this.rejectFunction = reject;
        this.resolveFunction = resolve;
    }

    public resolve(item?: U): void {
        if (!this.isPending) {
            return;
        }
        this.status = PromiseHandlerStatus.RESOLVED;
        this.resolveFunction(item);
    }

    public reject(item?: V): void {
        if (!this.isPending) {
            return;
        }
        this.status = PromiseHandlerStatus.REJECTED;
        this.rejectFunction(item);
    }

    public destroy(): void {
        this.status = null;
        this.promise = null;

        this.rejectFunction = null;
        this.resolveFunction = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isResolved(): boolean {
        return this.status === PromiseHandlerStatus.RESOLVED;
    }

    public get isRejected(): boolean {
        return this.status === PromiseHandlerStatus.REJECTED;
    }

    public get isPending(): boolean {
        return this.status === PromiseHandlerStatus.PENDING;
    }

    public get isCompleted(): boolean {
        return !this.isPending;
    }
}

export enum PromiseHandlerStatus {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    RESOLVED = 'RESOLVED'
}
