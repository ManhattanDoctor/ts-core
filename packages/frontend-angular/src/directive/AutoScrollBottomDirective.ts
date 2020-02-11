import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { InfiniteScrollDirective } from './InfiniteScrollDirective';
@Directive({
    selector: '[vi-auto-scroll-bottom]'
})
export class AutoScrollBottomDirective extends InfiniteScrollDirective {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    @Output()
    public triggerChanged: EventEmitter<void> = new EventEmitter<void>();

    private _trigger: any;
    private triggerTimer: any;
    private triggerDelta: number = 0;

    private isScrollLocked: boolean = false;
    private lastScrollHeight: number;

    private isNeedScroll: boolean = true;
    private isNeedRemainScroll: boolean = false;

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        if (!this._scrollValue) this._scrollValue = this.scrollHeight;
        super.initialize();
    }

    protected checkTrigger = () => {
        this.isScrollLocked = false;
        if (this.isNeedScroll) {
            this.scrollBottom();
        } else if (this.isNeedRemainScroll) {
            this.scrollRemain();
        } else if (this.triggerDelta > 0) {
            this.triggerDelta = 0;
            this.triggerChanged.emit();
        }
    };

    protected scrollRemain(): void {
        this.isNeedRemainScroll = false;
        this.scrollTo(this.scrollHeight - this.lastScrollHeight);
    }

    public scrollBottom(): void {
        this.scrollTo(this.scrollHeight);
    }

    // --------------------------------------------------------------------------
    //
    //	Event Handlers
    //
    // --------------------------------------------------------------------------

    protected scrollChangedHandler() {
        super.scrollChangedHandler();
        if (!this.isInitialized || this.isScrollLocked) return;

        let value = this.scrollTop;
        let bottomValue = value + this.clientHeight + this.elementHeight;

        this.isNeedScroll = bottomValue >= this.scrollHeight;
        this.isNeedRemainScroll = value <= this.elementHeight;

        if (this.isNeedRemainScroll) this.lastScrollHeight = this.scrollHeight;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();

        clearTimeout(this.triggerTimer);
        this.triggerTimer = null;
        this.trigger = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    @Input('vi-auto-bottom-scroll')
    public set trigger(value: number) {
        if (value === this._trigger) {
            return;
        }
        if (!isNaN(this._trigger) && !isNaN(value)) {
            this.triggerDelta = value - this._trigger;
        }

        this._trigger = value;
        if (!this.isInitialized) {
            return;
        }
        this.isScrollLocked = true;
        clearTimeout(this.triggerTimer);
        this.triggerTimer = setTimeout(this.checkTrigger, InfiniteScrollDirective.INITIALIZATION_DELAY);
    }
}
