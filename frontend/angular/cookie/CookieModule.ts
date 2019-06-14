import { ModuleWithProviders, NgModule } from '@angular/core';
import { CookieOptions } from './CookieOptions';
import { CookieService } from './CookieService';

@NgModule({})
export class CookieModule {
    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static forChild(options?: CookieOptions): ModuleWithProviders {
        return {
            ngModule: CookieModule,
            providers: [
                {
                    provide: CookieService,
                    useValue: new CookieService(options)
                }
            ]
        };
    }

    public static forRoot(options?: CookieOptions): ModuleWithProviders {
        return {
            ngModule: CookieModule,
            providers: [
                {
                    provide: CookieService,
                    useValue: new CookieService(options)
                }
            ]
        };
    }
}
