import { Pipe, PipeTransform } from '@angular/core';
import { DateUtil } from '@ts-core/common/util';
import moment from 'moment';
import numeral from 'numeral';

@Pipe({
    name: 'viMomentTime'
})
export class MomentTimePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(time: number, isDigital?: boolean): string {
        return isDigital ? this.transformDigitalTime(time) : this.transformTime(time);
    }

    public transformTime(time: number): string {
        let value = moment();
        value.add(time, 'milliseconds');
        return value.fromNow();
    }

    public transformDigitalTime(time: number): string {
        let seconds = time / DateUtil.MILISECONDS_SECOND;
        return numeral(seconds).format('00:00:00');
    }
}
