import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'viCamelCase'
})
export class CamelCasePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: any): string {
        if (!value) {
            return '---';
        }
        return _.camelCase(value);
    }

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {}
}
