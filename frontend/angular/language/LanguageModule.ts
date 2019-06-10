import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpHandler } from '@angular/common/http';
import { Injector, NgModule, ModuleWithProviders } from '@angular/core';
import { TranslateModule, TranslateParser } from '@ngx-translate/core';
import { CookieModule, CookieOptionsProvider, COOKIE_OPTIONS } from 'ngx-cookie';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguageMessageFormatParser } from './LanguageMessageFormatParser';
import { LanguageResolver } from './LanguageResolver';
import { LanguageService } from './LanguageService';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
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
        { provide: HttpHandler, useValue: {} },
        { provide: CookieOptionsProvider, useValue: CookieOptionsProvider, deps: [COOKIE_OPTIONS, Injector] }
    ],
    exports: [TranslateModule, CookieModule]
})
export class LanguageModule {}
