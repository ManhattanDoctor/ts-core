export abstract class ApiError implements Error {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static CODE_TIMEOUT: number = -2;
    public static CODE_NO_CONNECTION: number = -1;

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _code: number;
    protected _name: string;
    protected _message: string;

    protected _isSystem: boolean;
    protected _isSpecial: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: any, locale?: string) {
        this._code = this.getCode(data);
        this._message = this.getMessage(data, locale);
        this.commitCodeProperties();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected abstract getCode(data: any): number;

    protected abstract getMessage(data: any, locale: string): string;

    protected abstract commitCodeProperties(): void;

    // --------------------------------------------------------------------------
    //
    // 	Protected Properties
    //
    // --------------------------------------------------------------------------

    protected get systemCodes(): Array<number> {
        return [ApiError.CODE_NO_CONNECTION, ApiError.CODE_TIMEOUT];
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get code(): number {
        return this._code;
    }

    public get name(): string {
        return this._name;
    }

    public get message(): string {
        return this._message;
    }

    public get isSystem(): boolean {
        return this._isSystem;
    }

    public get isSpecial(): boolean {
        return this._isSpecial;
    }
}
