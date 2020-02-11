import * as _ from 'lodash';
import { ObjectUtil } from '../../util';
import { ApiError } from '../ApiError';

export class HttpApiError extends ApiError {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    private static CODE_FIELDS = ['code', 'status', 'errorCode', 'statusCode'];
    private static MESSAGE_FIELDS = ['text', 'message', 'description', 'error', 'statusText'];

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(data: any, locale?: string): ApiError {
        return new HttpApiError(data, locale);
    }

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

    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public defaultLocale: string = 'en';

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getCode(data: any): number {
        if (data instanceof ApiError) {
            return data.code;
        }

        if (_.isNumber(data)) {
            return data;
        }

        if (!_.isObject(data)) {
            return null;
        }

        for (let item of this.codeFields) {
            let value = data[item];
            if (_.isNumber(value)) {
                return value;
            }
        }
        return null;
    }

    protected getMessage(data: any, locale: string): string {
        if (data instanceof ApiError) {
            return data.message;
        }

        if (_.isString(data)) {
            return data;
        }

        if (_.isArray(data.message)) {
            return HttpApiError.getValidatorMessage(data.message, `<br/>`);
        }

        if (!_.isObject(data)) {
            return null;
        }

        for (let item of this.messageFields) {
            let value = data[item];
            if (!_.isEmpty(value)) {
                data = value;
                break;
            }
        }

        return _.isString(data) ? data : this.getTranslatedMessage(data, locale || this.defaultLocale);
    }

    protected commitCodeProperties(): void {
        this._isSystem = this.isCodeContains(this.systemCodes);
        this._isSpecial = this.isCodeContains(this.specialCodes);
    }

    protected getTranslatedMessage(data: any, locale: string): string {
        return ObjectUtil.hasOwnProperty(data, locale) ? data[locale] : data.toString();
    }

    protected isCodeContains(items: Array<number>): boolean {
        if (_.isNaN(this._code) || _.isEmpty(items)) {
            return false;
        }
        return items.includes(this._code);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Properties
    //
    // --------------------------------------------------------------------------

    protected get codeFields(): Array<string> {
        return HttpApiError.CODE_FIELDS;
    }

    protected get messageFields(): Array<string> {
        return HttpApiError.MESSAGE_FIELDS;
    }

    protected get specialCodes(): Array<number> {
        return null;
    }
}
