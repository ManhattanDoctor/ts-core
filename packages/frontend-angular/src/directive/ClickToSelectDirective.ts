import { Directive, ElementRef, HostListener } from '@angular/core';
import { Destroyable } from '@ts-core/common';
import { ViewUtil } from '../util/ViewUtil';

@Directive({
    selector: '[vi-click-to-select]'
})
export class ClickToSelectDirective extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected element: HTMLElement;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef) {
        super();
        this.element = ViewUtil.parseElement(element.nativeElement);
    }

    // --------------------------------------------------------------------------
    //
    //	Event Handlers
    //
    // --------------------------------------------------------------------------

    @HostListener('click', ['$event'])
    private clickHandler(event: MouseEvent) {
        if (event.detail >= 3) {
            ViewUtil.selectContent(this.element, true);
        }
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

        this.element = null;
    }
}
