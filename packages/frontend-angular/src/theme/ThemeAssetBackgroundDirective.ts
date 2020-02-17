import { Directive, ElementRef } from '@angular/core';
import { ThemeService } from '@ts-core/frontend/theme';
import { ViewUtil } from '../util/ViewUtil';
import { ThemeAssetDirective } from './ThemeAssetDirective';

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
