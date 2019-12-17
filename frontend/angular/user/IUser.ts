import { IDestroyable } from '@ts-core/common';

export abstract class IUser<T = any> implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public id: string | number;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract update(data: T): void;
    public abstract destroy(): void;
}
