import { Directive, HostListener, Input } from '@angular/core';
import { Destroyable } from '../../../common/Destroyable';
import { ViewUtil } from '../util';

@Directive({
    selector: '[vi-click-to-copy]'
})
export class ClickToCopyDirective extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Input('vi-click-to-copy')
    public element: HTMLElement;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    @HostListener('click', ['$event'])
    private clickHandler(event: MouseEvent) {
        ViewUtil.selectContent(this.element, true);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        this.element = null;
    }
}
