import { IDestroyable } from './IDestroyable';

export abstract class Destroyable implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract destroy(): void;

    public ngOnDestroy(): void {
        this.destroy();
    }
}
