import { NgModule } from '@angular/core';
import { AssetBackgroundDirective } from './AssetBackgroundDirective';
import { AssetBackgroundPipe } from './AssetBackgroundPipe';
import { AssetIconPipe } from './AssetIconPipe';
import { AssetImagePipe } from './AssetImagePipe';

@NgModule({
    declarations: [AssetBackgroundDirective, AssetIconPipe, AssetImagePipe, AssetBackgroundPipe],
    exports: [AssetBackgroundDirective, AssetIconPipe, AssetImagePipe, AssetBackgroundPipe]
})
export class AssetModule {}
