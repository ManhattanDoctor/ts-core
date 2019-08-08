import { Pipe, PipeTransform } from '@angular/core';
import { Assets } from '../../asset';

@Pipe({
    name: 'viAssetIcon'
})
export class AssetIconPipe implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(name: string, extension: string = 'png'): string {
        return Assets.getIcon(name, extension);
    }
}
