export abstract class Destroyable {
    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public abstract destroy(): void;

    public ngOnDestroy(): void {
        this.destroy();
    }
}
