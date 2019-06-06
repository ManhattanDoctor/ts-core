import { NgModule } from '@angular/core';
import { AssetBackgroundDirective } from '../directive';
import { AssetIconPipe } from './AssetIconPipe';
import { AssetImagePipe } from './AssetImagePipe';

@NgModule({
    declarations: [AssetBackgroundDirective, AssetIconPipe, AssetImagePipe],
    exports: [AssetBackgroundDirective, AssetIconPipe, AssetImagePipe]
})
export class AssetModule {}
