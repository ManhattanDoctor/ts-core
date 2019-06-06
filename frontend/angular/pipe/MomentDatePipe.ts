import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';

@Pipe({
    name: 'formatMomentDate'
})
export class MomentDatePipe implements PipeTransform {
    //--------------------------------------------------------------------------
    //
    //	Static Methods
    //
    //--------------------------------------------------------------------------

    public static parseMoment(value: Date | Moment): Moment {
        if (_.isDate(value)) {
            return moment(value);
        }
        return value as Moment;
    }
    //--------------------------------------------------------------------------
    //
    //	Constants
    //
    //--------------------------------------------------------------------------

    public static DEFAULT_FORMAT = 'LLL';

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public transform(value: Date | Moment, format?: string): string {
        if (_.isNaN(value)) {
            return '---';
        }

        let item = MomentDatePipe.parseMoment(value);
        return item.format(format || MomentDatePipe.DEFAULT_FORMAT);
    }

    public fromNow(value: Date | Moment, format: string = 'LLL'): string {
        if (_.isNaN(value)) {
            return null;
        }

        let item = MomentDatePipe.parseMoment(value);
        let date = item.fromNow();
        if (!_.isNil(format)) {
            date += ' (' + item.format(format) + ')';
        }
        return date;
    }

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor() {}
}
