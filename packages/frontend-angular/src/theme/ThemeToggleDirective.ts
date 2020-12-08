import { Directive, HostListener } from '@angular/core';
import { Destroyable } from '@ts-core/common';
import { ThemeService } from '@ts-core/frontend/theme';

@Directive({
    selector: '[vi-theme-toggle]'
})
export class ThemeToggleDirective extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private theme: ThemeService) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //	Event Handlers
    //
    // --------------------------------------------------------------------------

    @HostListener('click', ['$event'])
    private clickHandler(event: MouseEvent) {
        let themes = this.theme.themes.collection;
        let length = themes.length;
        if (length < 2) {
            return;
        }

        let index = 0;
        if (this.theme.theme) {
            index = themes.indexOf(this.theme.theme);
            if (index < length - 1) {
                index++;
            } else {
                index = 0;
            }
        }

        this.theme.theme = themes[index];
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }
        this.theme = null;
    }
}
