import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './LanguageService';

@Pipe({
    name: 'viTranslatePure'
})
export class LanguagePurePipe implements PipeTransform {
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
