import { Directive, ElementRef } from '@angular/core';
import { ThemeAssetDirective } from './ThemeAssetDirective';
import { ThemeService } from './ThemeService';
import { ViewUtil } from '../util';

@Directive({
    selector: '[vi-theme-background]'
})
export class ThemeAssetBackgroundDirective extends ThemeAssetDirective {
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
        let value = 'url(' + this.source + ')';
        ViewUtil.setStyle(this.element, 'backgroundImage', value);
    }
}
