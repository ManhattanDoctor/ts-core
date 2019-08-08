export class MenuItemBase {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _name: string;
    protected _isEnabled: boolean = true;

    public checkEnabled: (item: MenuItemBase) => boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(public nameId: string, public sortIndex: number = NaN, public iconId?: string) {}

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitNameProperties(): void {}
    protected commitIsEnabledProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    public set isEnabled(value: boolean) {
        if (value === this._isEnabled) {
            return;
        }
        this._isEnabled = value;
        this.commitIsEnabledProperties();
    }

    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        if (value === this._name) {
            return;
        }
        this._name = value;
        this.commitNameProperties();
    }
}
