import * as _ from 'lodash';

export class UrlUtil {
    // --------------------------------------------------------------------------
    //
    //	Static Properties
    //
    // --------------------------------------------------------------------------

    private static TAG_REG_EXP = /<[^>]*>/gi;
    private static ABSOLUTE_URL_EXP = /^https?:\/\//i;
    private static IMAGE_REG_EXP = /(http[s]?:\/\/.*\.(?:png|jpg|jpeg))/i;

    // --------------------------------------------------------------------------
    //
    //	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseUrl(value: any): string {
        if (_.isNil(value)) {
            return null;
        }

        value = value.toString();
        if (value.substr(-1) != '/') {
            value += '/';
        }
        return value;
    }

    /*
    public static convertToParams(param: any): HttpParams {
        if (_.isNil(param)) {
            return null;
        }
        let entries = Object.entries(param);
        if (_.isEmpty(entries.length)) {
            return null;
        }
        let value = new HttpParams();
        for (let item of entries) {
            value = value.append(item[0], item[1].toString());
        }
        return value;
    }
    */

    public static isImageUrl(url: string): boolean {
        return !_.isEmpty(url) ? UrlUtil.IMAGE_REG_EXP.test(url) : false;
    }

    public static isAbsoluteUrl(url: string): boolean {
        return !_.isEmpty(url) ? UrlUtil.ABSOLUTE_URL_EXP.test(url) : false;
    }

    public static removeTags(text: string): string {
        return !_.isNil(text) ? text.replace(UrlUtil.TAG_REG_EXP, '') : null;
    }
}
