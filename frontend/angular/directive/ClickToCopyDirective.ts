import { Directive, HostListener, Input } from '@angular/core';
import { Destroyable } from '@ts-core/common/Destroyable';
import { DateUtil } from '@ts-core/common/util';
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

    private selectionClearTimer: any;

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

        clearTimeout(this.selectionClearTimer);
        this.selectionClearTimer = setTimeout(this.selectionRemove, DateUtil.MILISECONDS_SECOND / 2);
    }

    private selectionRemove = (): void => {
        ViewUtil.selectContent(null);
    };

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        this.element = null;
        clearTimeout(this.selectionClearTimer);
    }
}
