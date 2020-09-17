import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { LanguageService } from '@ts-core/frontend/language';

export class LanguageMomentDateAdapter extends MomentDateAdapter {
    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(language: LanguageService) {
        super(language.locale);
        language.completed.subscribe(item => {
            this.setLocale(item.locale);
        });
    }
}
