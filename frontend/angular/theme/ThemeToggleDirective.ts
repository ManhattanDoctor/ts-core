import { Directive, HostListener } from '@angular/core';
import { Destroyable } from '../../Destroyable';
import { ThemeService } from './ThemeService';

@Directive({
    selector: '[vi-theme-toggle]'
})
export class ThemeToggleDirective extends Destroyable {
    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private theme: ThemeService) {
        super();
    }

    //--------------------------------------------------------------------------
    //
    //	Event Handlers
    //
    //--------------------------------------------------------------------------

    @HostListener('click', ['$event'])
    private clickHandler(event: MouseEvent) {
        let index = 0;
        if (this.theme.theme) {
            index = this.theme.themes.collection.indexOf(this.theme.theme);
            if (index >= this.theme.themes.length - 1) {
                index = 0;
            } else {
                index++;
            }
        }
        if (index <= this.theme.themes.length - 1) {
            this.theme.theme = this.theme.themes.collection[index];
        }
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public destroy(): void {
        this.theme = null;
    }
}
