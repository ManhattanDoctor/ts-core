import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { LanguageService } from '@ts-core/frontend/language';
import * as _ from 'lodash';

@Pipe({
    name: 'viNgModelError'
})
export class NgModelErrorPipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(value: ValidationErrors): string {
        if (_.isNil(value)) {
            return null;
        }
        let keys = _.keys(value);
        if (_.isEmpty(keys)) {
            return null;
        }
        let key = keys[0];
        return this.translateError(key, value[key]);
    }

    public translateError(key: string, value: any): string {
        return this.language.translate('error.form.' + key, value);
    }

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected language: LanguageService) {}
}
