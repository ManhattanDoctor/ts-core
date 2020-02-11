import { Pipe, PipeTransform } from '@angular/core';
import { Assets } from '@ts-core/frontend/asset';

@Pipe({
    name: 'viAssetImage'
})
export class AssetImagePipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(name: string, extension: string = 'png'): string {
        return Assets.getImage(name, extension);
    }
}
