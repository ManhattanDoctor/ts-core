import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { ICookieOptions } from '@ts-core/frontend/cookie';
import { CookieService } from './CookieService';

@NgModule()
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
                    provide: COOKIE_OPTIONS,
                    useValue: options || {}
                },
                {
                    provide: CookieService,
                    deps: [COOKIE_OPTIONS],
                    useFactory: cookieServiceFactory
                }
            ]
        };
    }
}

export function cookieServiceFactory(options: ICookieOptions): CookieService {
    return new CookieService(options);
}

export const COOKIE_OPTIONS = new InjectionToken<ICookieOptions>(`COOKIE_OPTIONS`);
