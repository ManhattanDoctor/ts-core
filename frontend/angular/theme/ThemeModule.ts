import { Injector, NgModule } from '@angular/core';
import { CookieModule, CookieOptionsProvider, COOKIE_OPTIONS } from 'ngx-cookie';
import { ThemeAssetBackgroundDirective } from './ThemeAssetBackgroundDirective';
import { ThemeAssetDirective } from './ThemeAssetDirective';
import { ThemeImageDirective } from './ThemeImageDirective';
import { ThemeService } from './ThemeService';
import { ThemeToggleDirective } from './ThemeToggleDirective';

@NgModule({
    imports: [CookieModule.forChild()],
    providers: [ThemeService, { provide: CookieOptionsProvider, useValue: CookieOptionsProvider, deps: [COOKIE_OPTIONS, Injector] }],
    declarations: [ThemeAssetDirective, ThemeImageDirective, ThemeToggleDirective, ThemeAssetBackgroundDirective],
    exports: [ThemeAssetDirective, ThemeImageDirective, ThemeToggleDirective, ThemeAssetBackgroundDirective]
})
export class ThemeModule {}
