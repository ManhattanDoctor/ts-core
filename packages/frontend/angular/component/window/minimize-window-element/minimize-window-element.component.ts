import { Component, ElementRef } from '@angular/core';
import { ViewUtil } from '../../../util';
import { WindowEvent } from '../../../window';
import { WindowElement } from '../WindowElement';

@Component({
    selector: 'minimize-window-element',
    styleUrls: ['minimize-window-element.component.scss'],
    template: ''
})
export class MinimizeWindowElementComponent extends WindowElement {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public static ICON_CLASS: string;
    public static ICON_MINIMIZE_VALUE: string;
    public static ICON_MAXIMIZE_VALUE: string;

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

    private commitIconProperties = (): void => {
        let icon = this.window.isMinimized ? MinimizeWindowElementComponent.ICON_MAXIMIZE_VALUE : MinimizeWindowElementComponent.ICON_MINIMIZE_VALUE;
        ViewUtil.setProperty(this.nativeElement, 'innerHTML', icon);
    };

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitWindowProperties(): void {
        super.commitWindowProperties();
        this.addSubscription(
            this.window.events.subscribe(event => {
                if (event === WindowEvent.MINIMIZED_CHANGED) {
                    this.commitIconProperties();
                }
            })
        );
    }

    protected createChildren(): void {
        super.createChildren();

        if (MinimizeWindowElementComponent.ICON_MINIMIZE_VALUE) {
            ViewUtil.setProperty(this.nativeElement, 'innerHTML', MinimizeWindowElementComponent.ICON_MINIMIZE_VALUE);
        }

        if (MinimizeWindowElementComponent.ICON_CLASS) {
            ViewUtil.addClasses(this.nativeElement, MinimizeWindowElementComponent.ICON_CLASS);
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
            this.window.isMinimized = !this.window.isMinimized;
        }
    };
}
