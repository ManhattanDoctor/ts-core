import { Directive, ElementRef } from '@angular/core';
import { ThemeAssetDirective } from './ThemeAssetDirective';
import { ThemeService } from './ThemeService';

@Directive({
    selector: '[vi-theme-image]'
})
export class ThemeImageDirective extends ThemeAssetDirective {
    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef, theme: ThemeService) {
        super(element, theme);
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitSourceProperties(): void {
        (this.element as HTMLImageElement).src = this.source;
    }
}
