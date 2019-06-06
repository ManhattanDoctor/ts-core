export class Language {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    private _name: string;
    private _locale: string;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(locale: string = '', name: string = '') {
        this._name = name;
        this._locale = locale;
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public toEqual(value: Language | string): boolean {
        if (!value) {
            return false;
        }
        if (value instanceof Language) {
            return value.locale == this.locale;
        }
        return value === this.locale;
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get id(): string {
        return this._locale;
    }

    public get locale(): string {
        return this._locale;
    }

    public get name(): string {
        return this._name;
    }
}
