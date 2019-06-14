import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './LanguageService';

@Pipe({
    name: 'viTranslate'
})
export class LanguagePipe implements PipeTransform {
    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public transform(key: string, params?: any): string {
        return this.language.translate(key, params);
    }

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private language: LanguageService) {}
}
