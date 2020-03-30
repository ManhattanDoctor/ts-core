import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { Moment } from 'moment';
import moment from 'moment';

@Pipe({
    name: 'viMomentDate'
})
export class MomentDatePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseMoment(value: Date | Moment): Moment {
        if (_.isDate(value)) {
            return moment(value);
        }
        return value as Moment;
    }
    // --------------------------------------------------------------------------
    //
    //	Constants
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_FORMAT = 'LLL';

    public static fromNow(value: Date | Moment, format: string = 'LLL'): string {
        if (_.isNil(value)) {
            return '---';
        }

        let item = MomentDatePipe.parseMoment(value);
        let date = item.fromNow();
        date = date.charAt(0).toUpperCase() + date.slice(1);
        if (!_.isNil(format)) {
            date += ' (' + item.format(format) + ')';
        }
        return date;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: Date | Moment, format?: string): string {
        if (_.isNil(value)) {
            return '---';
        }

        let item = MomentDatePipe.parseMoment(value);
        return item.format(format || MomentDatePipe.DEFAULT_FORMAT);
    }
}
