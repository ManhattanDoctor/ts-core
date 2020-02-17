import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { ICookieService } from '@ts-core/frontend/cookie';
import { IThemeServiceOptions, ThemeService } from '@ts-core/frontend/theme';
import { CookieService } from '../cookie';
import { CookieModule } from '../cookie/CookieModule';
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
                    provide: THEME_OPTIONS_TOKEN,
                    useValue: options
                },
                {
                    provide: ThemeService,
                    deps: [CookieService, THEME_OPTIONS_TOKEN],
                    useFactory: themeServiceFactory
                }
            ]
        };
    }
}

export const THEME_OPTIONS_TOKEN = new InjectionToken<IThemeServiceOptions>(`Theme options`);

export function themeServiceFactory(cookie: ICookieService, settings?: IThemeServiceOptions): ThemeService {
    if (settings && !settings.service) {
        settings.service = cookie;
    }
    return new ThemeService(settings);
}
