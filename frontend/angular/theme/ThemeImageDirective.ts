import { Directive } from '@angular/core';
import { ThemeAssetDirective } from './ThemeAssetDirective';

@Directive({
    selector: '[vi-theme-image]'
})
export class ThemeImageDirective extends ThemeAssetDirective {
    //--------------------------------------------------------------------------
    //
    //	Private Methods
    //
    //--------------------------------------------------------------------------

    protected commitSourceProperties(): void {
        (this.element as HTMLImageElement).src = this.source;
    }
}
