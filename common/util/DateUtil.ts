import * as _ from 'lodash';

export class DateUtil {
    // --------------------------------------------------------------------------
    //
    //	Static Properties
    //
    // --------------------------------------------------------------------------

    public static MILISECONDS_YEAR = 12 * 30 * 24 * 60 * 60 * 1000;
    public static MILISECONDS_MONTH = 30 * 24 * 60 * 60 * 1000;
    public static MILISECONDS_DAY = 24 * 60 * 60 * 1000;
    public static MILISECONDS_HOUR = 60 * 60 * 1000;
    public static MILISECONDS_MINUTE = 60 * 1000;
    public static MILISECONDS_SECOND = 1000;

    // --------------------------------------------------------------------------
    //
    //	Static Methods
    //
    // --------------------------------------------------------------------------

    public static getTime(value: any): number {
        let date = DateUtil.parseDate(value);
        return date ? date.getTime() : NaN;
    }

    public static getDate(time: number): Date {
        let date = new Date();
        date.setTime(time);
        return date;
    }

    public static parseDate(value: any): Date {
        if (_.isNil(value)) {
            return null;
        }
        if (_.isDate(value)) {
            return value;
        }

        let dateNumber = parseFloat(value);
        if (!_.isNaN(value) && _.isNumber(dateNumber)) {
            return dateNumber > 0 ? DateUtil.getDate(dateNumber) : null;
        }
        if (_.isArray(value)) {
            return value.length == 3 ? new Date(value[2], value[1], value[0]) : null;
        }
        if (_.isString(value)) {
            return DateUtil.parseDate(value.split('.'));
        }
        return null;
    }

    public isEqual(first: Date, second: Date): boolean {
        if (first === second) {
            return true;
        }
        if (_.isNil(first) || _.isNil(second)) {
            return false;
        }
        return first.getTime() == second.getTime();
    }

    public static isUnknown(date: Date): boolean {
        return _.isNil(date);
    }
}
