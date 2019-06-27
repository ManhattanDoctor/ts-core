import * as _ from 'lodash';
import { ObjectUtil } from '../../common/util';

export class ApiError implements Error {
    //--------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    //--------------------------------------------------------------------------

    public static ERROR_CODE_IDLE_TIMEOUT: number = -2;
    public static ERROR_CODE_NO_CONNECTION: number = -1;
    public static ERROR_SPECIAL_CODES: Array<number> = [];

    public static CODE_FILEDS: Array<string> = ['code', 'status', 'errorCode'];
    public static MESSAGES_FILEDS: Array<string> = ['text', 'message', 'description', 'error', 'statusText'];

    public static DEFAULT_LANGUAGE = 'en';

    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static getValidatorMessage(items: Array<any>, newLine: string = '\n'): string {
        let value = ``;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            value += `"${item.property}" property has failed the following constraints:${newLine}`;
            _.forIn(item.constraints, (description, validator) => {
                value += `- ${validator} : ${description}`;
            });
            if (i < items.length - 1) {
                value += `${newLine}${newLine}`;
            }
        }
        return value;
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    //--------------------------------------------------------------------------

    protected _code: number;
    protected _name: string;
    protected _message: string;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(data: any, language?: string) {
        this._code = this.getCode(data);
        this._message = this.getMessage(data, language || ApiError.DEFAULT_LANGUAGE);
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected getCode(data: any): number {
        if (_.isNumber(data)) {
            return data;
        }

        if (!_.isObject(data)) {
            return null;
        }

        for (let item of ApiError.CODE_FILEDS) {
            let value = data[item];
            if (_.isNumber(value)) {
                return value;
            }
        }
        return null;
    }

    protected getMessage(data: any, language: string): string {
        if (_.isString(data)) {
            return data;
        }

        if (!_.isObject(data)) {
            return null;
        }

        for (let item of ApiError.MESSAGES_FILEDS) {
            let value = data[item];
            if (!_.isEmpty(value)) {
                data = value;
                break;
            }
        }

        return _.isString(data) ? data : this.getTranslatedMessage(data, language);
    }

    protected getTranslatedMessage(data: any, language: string): string {
        return ObjectUtil.hasOwnProperty(data, language) ? data[language] : data.toString();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

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
