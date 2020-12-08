import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Interactable } from '@interactjs/types/types';
import * as interact from 'interactjs';
import { Destroyable } from '@ts-core/common';
import { ViewUtil } from '../util/ViewUtil';

@Directive({
    selector: '[vi-resize]'
})
export class ResizeDirective extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    @Output()
    public resize: EventEmitter<any> = new EventEmitter();

    @Input()
    public isTop: boolean = false;
    @Input()
    public isLeft: boolean = false;
    @Input()
    public isRight: boolean = false;
    @Input()
    public isBottom: boolean = false;

    private interactable: Interactable;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef) {
        super();

        this.interactable = interact.default(ViewUtil.parseElement(element));
        // this.interactable.styleCursor(false);

        let param = {} as any;
        param.top = this.isTop;
        param.left = this.isLeft;
        param.right = this.isRight;
        param.bottom = this.isBottom;
        this.interactable.resizable(param);
        this.interactable.on('resizemove', this.resizeHandler);
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    private resizeHandler = (event: any) => {
        if (event.dx !== 0 || event.dy !== 0) {
            this.resize.emit(event);
        }
    };

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

        if (this.interactable) {
            this.interactable.unset();
            this.interactable = null;
        }
    }
}
