import { IDestroyable } from '../IDestroyable';

export class PromiseHandler<U = any, V = string> implements IDestroyable {
    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static create<U = any, V = string>(): PromiseHandler<U, V> {
        let item = new PromiseHandler<U, V>();
        item.promise = new Promise<U>((resolve, reject) => {
            item.resolve = resolve;
            item.reject = reject;
        });
        return item;
    }

    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public reject: (item?: V) => void;
    public resolve: (item?: U) => void;
    public promise: Promise<U>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor() {}

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public destroy(): void {
        this.reject = null;
        this.promise = null;
        this.resolve = null;
    }
}
