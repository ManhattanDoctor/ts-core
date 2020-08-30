import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { ICookieService } from '@ts-core/frontend/cookie';
import { ILanguageServiceOptions, LanguageService } from '@ts-core/frontend/language';
import { CookieModule } from '../cookie/CookieModule';
import { CookieService } from '../cookie/CookieService';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguagePipe } from './LanguagePipe';
import { LanguagePurePipe } from './LanguagePurePipe';
import { LanguageResolver } from './LanguageResolver';
import { MatPaginatorIntl } from '@angular/material';

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
                    provide: LANGUAGE_OPTIONS,
                    useValue: options || {}
                },
                {
                    provide: LanguageService,
                    deps: [CookieService, LANGUAGE_OPTIONS],
                    useFactory: languageServiceFactory
                },
                {
                    provide: LanguageResolver,
                    deps: [LanguageService],
                    useClass: LanguageResolver
                },
                {
                    provide: MatPaginatorIntl,
                    deps: [LanguageService],
                    useClass: LanguageMatPaginatorIntl
                }
            ]
        };
    }
}

export function languageServiceFactory(cookie: ICookieService, options?: ILanguageServiceOptions): LanguageService {
    if (options && !options.service) {
        options.service = cookie;
    }
    return new LanguageService(options);
}

export const LANGUAGE_OPTIONS = new InjectionToken<ILanguageServiceOptions>(`LANGUAGE_OPTIONS`);
