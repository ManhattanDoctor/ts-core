import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PipeBaseService } from '@ts-core/frontend-angular';
import { LanguageService } from '@ts-core/frontend/language';

@Injectable()
export class PipeService extends PipeBaseService {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(language: LanguageService, sanitizer: DomSanitizer) {
        super(language, sanitizer);
    }
}
