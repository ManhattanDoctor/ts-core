import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import numeral from 'numeral';

@Pipe({
    name: 'viFinance'
})
export class FinancePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Static Properties
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_FORMAT = '0,0';

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: number, format?: string, isNeedPlus: boolean = false): string {
        if (_.isNaN(value)) {
            return '---';
        }
        if (_.isNil(format)) {
            format = FinancePipe.DEFAULT_FORMAT;
        }
        if (isNeedPlus) {
            format = '+' + format;
        }
        return this.format(value, format);
    }

    public format(value: number, format: string): string {
        try {
            return numeral(value).format(format);
        } catch (error) {
            return value.toString();
        }
    }
}
