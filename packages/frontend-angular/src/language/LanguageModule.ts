import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { ICookieService } from '@ts-core/frontend/cookie';
import { ILanguageServiceOptions, LanguageService } from '@ts-core/frontend/language';
import { CookieModule, CookieService } from '../cookie';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguagePipe } from './LanguagePipe';
import { LanguagePurePipe } from './LanguagePurePipe';
import { LanguageResolver } from './LanguageResolver';

@NgModule({
    imports: [CookieModule],
    declarations: [LanguagePipe, LanguagePurePipe],
    exports: [LanguagePipe, LanguagePurePipe]
})
export class LanguageModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(options?: ILanguageServiceOptions): ModuleWithProviders {
        return {
            ngModule: LanguageModule,
            providers: [
                {
                    provide: LANGUAGE_OPTIONS_TOKEN,
                    useValue: options
                },
                {
                    provide: LanguageService,
                    deps: [CookieService, LANGUAGE_OPTIONS_TOKEN],
                    useFactory: languageServiceFactory
                },
                {
                    provide: LanguageResolver,
                    deps: [LanguageService],
                    useClass: LanguageResolver
                },
                {
                    provide: LanguageMatPaginatorIntl,
                    deps: [LanguageService],
                    useClass: LanguageMatPaginatorIntl
                }
            ]
        };
    }
}

export const LANGUAGE_OPTIONS_TOKEN = new InjectionToken<ILanguageServiceOptions>(`Language options`);

export function languageServiceFactory(cookie: ICookieService, settings?: ILanguageServiceOptions): LanguageService {
    if (settings && !settings.service) {
        settings.service = cookie;
    }
    return new LanguageService(settings);
}
