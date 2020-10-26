import { Component, ElementRef } from '@angular/core';
import { ViewUtil } from '../../../util/ViewUtil';
import { WindowElement } from '../WindowElement';

@Component({
    selector: 'vi-close-window-element',
    styleUrls: ['close-window-element.component.scss'],
    template: ''
})
export class CloseWindowElementComponent extends WindowElement {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public static ICON_CLASS: string = 'fas fa-times';
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

        if (CloseWindowElementComponent.ICON_VALUE) {
            ViewUtil.setProperty(this.nativeElement, 'innerHTML', CloseWindowElementComponent.ICON_VALUE);
        }
        if (CloseWindowElementComponent.ICON_CLASS) {
            ViewUtil.addClasses(this.nativeElement, CloseWindowElementComponent.ICON_CLASS);
        }

        ViewUtil.addClass(this.nativeElement, 'mouse-active');
        this.nativeElement.addEventListener('click', this.mouseClickHandler, true);
    }

    protected destroyChildren(): void {
        super.destroyChildren();
        this.nativeElement.removeEventListener('click', this.mouseClickHandler, true);
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    private mouseClickHandler = (event: MouseEvent): void => {
        event.stopPropagation();
        if (this.window) {
            this.window.close();
        }
    };
}
