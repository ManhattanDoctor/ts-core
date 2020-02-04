import { NgModule } from '@angular/core';
import { CookieModule } from '../cookie';
import { ThemeAssetBackgroundDirective } from './ThemeAssetBackgroundDirective';
import { ThemeAssetDirective } from './ThemeAssetDirective';
import { ThemeImageDirective } from './ThemeImageDirective';
import { ThemeService } from './ThemeService';
import { ThemeToggleDirective } from './ThemeToggleDirective';

@NgModule({
    imports: [CookieModule],
    providers: [ThemeService],
    declarations: [ThemeAssetDirective, ThemeImageDirective, ThemeToggleDirective, ThemeAssetBackgroundDirective],
    exports: [ThemeAssetDirective, ThemeImageDirective, ThemeToggleDirective, ThemeAssetBackgroundDirective]
})
export class ThemeModule {}
