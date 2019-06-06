import { NgModule } from '@angular/core';
import { AssetModule } from './asset';
import { LanguageModule } from './language';
import { ThemeModule } from './theme';

@NgModule({
    imports: [],
    exports: [AssetModule, LanguageModule, ThemeModule]
})
export class VIModule {}
