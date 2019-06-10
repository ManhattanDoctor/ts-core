import { NgModule } from '@angular/core';
import { LoadingService } from '../service';
import { VIModule } from '../VIModule';
import { AssetModule } from './asset';
import { LanguageModule } from './language';
import { ThemeModule } from './theme';
import { WindowModule } from './window';

@NgModule({
    imports: [VIModule],
    exports: [VIModule, AssetModule, LanguageModule, ThemeModule, WindowModule],
    providers: [LoadingService]
})
export class VIAngularModule {}
