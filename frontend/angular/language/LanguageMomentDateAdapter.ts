import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { LoadableEvent } from '../../../common';
import { LanguageService } from './LanguageService';

export class LanguageMomentDateAdapter extends MomentDateAdapter {
    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(language: LanguageService) {
        super(language.locale);
        language.events.subscribe(data => {
            if (data.type === LoadableEvent.COMPLETE) {
                this.setLocale(language.locale);
            }
        });
    }
}
