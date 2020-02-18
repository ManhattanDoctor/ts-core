import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AssetBackgroundDirective } from './AssetBackgroundDirective';
import { AssetBackgroundPipe } from './AssetBackgroundPipe';
import { AssetIconPipe } from './AssetIconPipe';
import { AssetImagePipe } from './AssetImagePipe';

@NgModule({
    imports: [CommonModule],
    declarations: [AssetBackgroundDirective, AssetImagePipe, AssetIconPipe, AssetBackgroundPipe],
    exports: [AssetBackgroundDirective, AssetImagePipe, AssetIconPipe, AssetBackgroundPipe]
})
export class AssetModule {}
