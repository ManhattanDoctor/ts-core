import { NgModule } from '@angular/core';
import { AssetModule } from './asset';
import { LanguageModule } from './language';
import { ThemeModule } from './theme';
import { WindowModule } from './window';

@NgModule({
    imports: [],
    exports: [AssetModule, LanguageModule, ThemeModule, WindowModule]
})
export class VIModule {}
