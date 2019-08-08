import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'viTruncate'
})
export class TruncatePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: any, maxLength?: number): string {
        if (!value) {
            return '---';
        }
        return _.truncate(value, { length: maxLength });
    }
}
