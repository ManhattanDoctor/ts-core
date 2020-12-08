import { Directive, HostListener, Input } from '@angular/core';
import { Destroyable } from '@ts-core/common';
import { DateUtil } from '@ts-core/common/util';
import { ViewUtil } from '../util/ViewUtil';

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
        super.destroy();
        if (this.isDestroyed) {
            return;
        }

        this.element = null;
        clearTimeout(this.selectionClearTimer);
    }
}
