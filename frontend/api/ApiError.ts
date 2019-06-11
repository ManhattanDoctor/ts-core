import * as _ from 'lodash';
import { TimeoutError } from 'rxjs';
import { ObjectUtil } from '../../common/util';

export class ApiError implements Error {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static createSystemError(error: any): ApiError {
        let data = { code: error instanceof TimeoutError ? ApiError.ERROR_CODE_IDLE_TIMEOUT : ApiError.ERROR_CODE_NO_CONNECTION, message: error.message };

        if (error.hasOwnProperty('code')) {
            data.code = error.code;
        }
        if (error.hasOwnProperty('message')) {
            data.message = error.message;
        }

        return new ApiError(data);
    }

    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE_IDLE_TIMEOUT: number = -2;
    public static ERROR_CODE_NO_CONNECTION: number = -1;
    public static ERROR_SPECIAL_CODES: Array<number> = [];

    public static DEFAULT_LANGUAGE = 'en';

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _code: number = NaN;
    protected _name: string;
    protected _message: string;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: any, language?: string) {
        if (data.hasOwnProperty('code')) {
            this._code = data.code;
        }
        this.parseMessage(data, language);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseMessage(data: any, language: string): void {
        this._message = data;

        if (data.hasOwnProperty('text')) {
            this._message = data.text;
        } else if (data.hasOwnProperty('message')) {
            this._message = data.message;
        } else if (data.hasOwnProperty('description')) {
            this._message = data.description;
        }

        if (!language) {
            language = ApiError.DEFAULT_LANGUAGE;
        }
        if (ObjectUtil.hasOwnProperty(data, language)) {
            this._message = data[language];
        }
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
        return this.code === ApiError.ERROR_CODE_NO_CONNECTION || this.code === ApiError.ERROR_CODE_IDLE_TIMEOUT;
    }

    public get isSpecial(): boolean {
        if (_.isNaN(this._code) || _.isEmpty(ApiError.ERROR_SPECIAL_CODES)) {
            return false;
        }
        return ApiError.ERROR_SPECIAL_CODES.includes(this._code);
    }
}
