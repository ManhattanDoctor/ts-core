import { Injector, NgModule } from '@angular/core';
import { TranslateModule, TranslateParser } from '@ngx-translate/core';
import { CookieModule, CookieOptionsProvider, COOKIE_OPTIONS } from 'ngx-cookie';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguageMessageFormatParser } from './LanguageMessageFormatParser';
import { LanguageResolver } from './LanguageResolver';
import { LanguageService } from './LanguageService';

@NgModule({
    imports: [
        CookieModule.forChild(),
        TranslateModule.forRoot({
            parser: {
                provide: TranslateParser,
                useClass: LanguageMessageFormatParser
            }
        })
    ],
    providers: [
        LanguageService,
        LanguageResolver,
        LanguageMatPaginatorIntl,
        { provide: CookieOptionsProvider, useValue: CookieOptionsProvider, deps: [COOKIE_OPTIONS, Injector] }
    ],
    exports: [TranslateModule]
})
export class LanguageModule {}
