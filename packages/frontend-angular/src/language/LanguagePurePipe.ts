import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '@ts-core/frontend/language';

@Pipe({
    name: 'viTranslatePure'
})
export class LanguagePurePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(key: string, params?: any): string {
        return this.language.translate(key, params);
    }

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private language: LanguageService) {}
}
