import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { ICookieService } from '@ts-core/frontend/cookie';
import { IThemeServiceOptions, ThemeService } from '@ts-core/frontend/theme';
import { CookieModule } from '../cookie/CookieModule';
import { CookieService } from '../cookie/CookieService';
import { ThemeAssetBackgroundDirective } from './ThemeAssetBackgroundDirective';
import { ThemeAssetDirective } from './ThemeAssetDirective';
import { ThemeImageDirective } from './ThemeImageDirective';
import { ThemeToggleDirective } from './ThemeToggleDirective';

@NgModule({
    imports: [CookieModule],
    declarations: [ThemeAssetDirective, ThemeImageDirective, ThemeToggleDirective, ThemeAssetBackgroundDirective],
    exports: [ThemeAssetDirective, ThemeImageDirective, ThemeToggleDirective, ThemeAssetBackgroundDirective]
})
export class ThemeModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(options?: IThemeServiceOptions): ModuleWithProviders {
        return {
            ngModule: ThemeModule,
            providers: [
                {
                    provide: THEME_OPTIONS,
                    useValue: options || {}
                },
                {
                    provide: ThemeService,
                    deps: [CookieService, THEME_OPTIONS],
                    useFactory: themeServiceFactory
                }
            ]
        };
    }
}

export function themeServiceFactory(cookie: ICookieService, options?: IThemeServiceOptions): ThemeService {
    if (options && !options.service) {
        options.service = cookie;
    }
    return new ThemeService(options);
}

export const THEME_OPTIONS = new InjectionToken<IThemeServiceOptions>(`THEME_OPTIONS`);
