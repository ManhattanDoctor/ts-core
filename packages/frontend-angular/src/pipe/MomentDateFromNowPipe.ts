import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';
import { MomentDatePipe } from './MomentDatePipe';

@Pipe({
    name: 'viMomentDateFromNow'
})
export class MomentDateFromNowPipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: Date | Moment, format?: string): string {
        return MomentDatePipe.fromNow(value, format);
    }
}
