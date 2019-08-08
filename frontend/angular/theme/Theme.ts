export class Theme {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    public name: string;
    public isDark: boolean;

    public styles: any;
    private _styleName: string;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        this.styles = {};
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public getStyle<T>(name: string): T {
        return this.styles ? this.styles[name] : null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public update(data: any): void {
        if (data.hasOwnProperty('name')) {
            this.name = data.name;
        }
        if (data.hasOwnProperty('styles')) {
            this.styles = data.styles;
        }
        if (data.hasOwnProperty('isDark')) {
            this.isDark = data.isDark;
        }
        if (data.hasOwnProperty('styleName')) {
            this._styleName = data.styleName;
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get id(): string {
        return this.name;
    }
    public get styleName(): string {
        return this._styleName || this.name + '-theme';
    }
}
