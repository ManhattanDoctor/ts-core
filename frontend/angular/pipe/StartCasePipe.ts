import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'viStartCase'
})
export class StartCasePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: any): string {
        if (!value) {
            return '---';
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
