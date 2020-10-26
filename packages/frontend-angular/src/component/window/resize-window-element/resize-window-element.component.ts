import { Component, ElementRef } from '@angular/core';
import { ViewUtil } from '../../../util/ViewUtil';
import { WindowElement } from '../WindowElement';
import * as _ from 'lodash';

@Component({
    selector: 'vi-resize-window-element',
    styleUrls: ['resize-window-element.component.scss'],
    template: ''
})
export class ResizeWindowElementComponent extends WindowElement {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public static ICON_CLASS: string = 'fas fa-arrows-alt';
    public static ICON_VALUE: string = null;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef) {
        super(element);
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected createChildren(): void {
        super.createChildren();

        if (ResizeWindowElementComponent.ICON_VALUE) {
            ViewUtil.setProperty(this.nativeElement, 'innerHTML', ResizeWindowElementComponent.ICON_VALUE);
        }
        if (ResizeWindowElementComponent.ICON_CLASS) {
            ViewUtil.addClasses(this.nativeElement, ResizeWindowElementComponent.ICON_CLASS);
        }

        ViewUtil.setStyle(this.nativeElement, 'cursor', 'pointer');
        this.nativeElement.addEventListener('click', this.mouseClickHandler, true);
    }

    protected destroyChildren(): void {
        this.nativeElement.removeEventListener('click', this.mouseClickHandler, true);
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    private mouseClickHandler = (event: MouseEvent) => {
        event.stopPropagation();

        if (!_.isNil(this.window)) {
            this.window.isMinimized = !this.window.isMinimized;
        }
    };
}
