import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { CookieOptions } from './CookieOptions';
import { CookieService } from './CookieService';

@NgModule({})
export class CookieModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(options?: CookieOptions): ModuleWithProviders {
        return {
            ngModule: CookieModule,
            providers: [
                {
                    provide: COOKIE_OPTIONS_TOKEN,
                    useValue: options
                },
                {
                    provide: CookieService,
                    deps: [COOKIE_OPTIONS_TOKEN],
                    useClass: CookieService
                }
            ]
        };
    }
}

export let COOKIE_OPTIONS_TOKEN = new InjectionToken<CookieOptions>(`Cookie Options`);
