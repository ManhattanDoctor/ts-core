import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AssetBackgroundDirective } from '../directive';
import { AssetIconPipe } from './AssetIconPipe';
import { AssetImagePipe } from './AssetImagePipe';

@NgModule({
    imports: [CommonModule],
    declarations: [AssetBackgroundDirective, AssetIconPipe, AssetImagePipe],
    exports: [AssetBackgroundDirective, AssetIconPipe, AssetImagePipe]
})
export class AssetModule {}
