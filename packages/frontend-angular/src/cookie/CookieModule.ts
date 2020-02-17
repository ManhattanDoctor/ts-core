import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { ICookieOptions } from '@ts-core/frontend/cookie';
import { CookieService } from './CookieService';

@NgModule({})
export class CookieModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(options?: ICookieOptions): ModuleWithProviders {
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

export const COOKIE_OPTIONS_TOKEN = new InjectionToken<ICookieOptions>(`Cookie options`);
