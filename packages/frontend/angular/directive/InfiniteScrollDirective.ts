import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { ScrollDirective } from './ScrollDirective';

@Directive({
    selector: '[vi-infinite-scroll]'
})
export class InfiniteScrollDirective extends ScrollDirective {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    @Output()
    public top: EventEmitter<number> = new EventEmitter();
    @Output()
    public bottom: EventEmitter<number> = new EventEmitter();

    @Input()
    public elementHeight: number = 50;

    // --------------------------------------------------------------------------
    //
    //	Event Handlers
    //
    // --------------------------------------------------------------------------

    protected scrollChangedHandler(): void {
        super.scrollChangedHandler();
        if (!this.isInitialized) {
            return;
        }
        let value = this.scrollTop;
        let bottomValue = value + this.clientHeight + this.elementHeight;

        if (bottomValue >= this.scrollHeight) {
            this.bottom.next(value);
        } else if (value <= this.elementHeight) {
            this.top.next(value);
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this.top = null;
        this.bottom = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Private Properties
    //
    // --------------------------------------------------------------------------

    protected get clientHeight(): number {
        return this.element.clientHeight;
    }
    protected get scrollHeight() {
        return this.element.scrollHeight;
    }
}
