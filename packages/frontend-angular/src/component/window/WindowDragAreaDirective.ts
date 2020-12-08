import { Directive, ElementRef, Input } from '@angular/core';
import { Interactable } from '@interactjs/types/types';
import * as interact from 'interactjs';
import { Destroyable } from '@ts-core/common';
import { IWindow } from '../../window/IWindow';
import { WindowDragable } from './WindowDragable';
import * as _ from 'lodash';

@Directive({
    selector: '[vi-window-drag-area]'
})
export class WindowDragAreaDirective extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private _window: WindowDragable;
    private _interactable: Interactable;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private element: ElementRef) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }
        if (!_.isNil(this._interactable)) {
            this._interactable.unset();
            this._interactable = null;
        }
        this.element = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private commitWindowProperties(): void {
        if (!this.window.config || this.window.config.isModal) {
            return;
        }
        this.interactable.draggable(true);
        this.interactable.on('dragmove', this.dragMoveHandler);
        this.interactable.on('dragstart', this.dragStartHandler);
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    private dragStartHandler = (event: any): void => {
        this._window.dragStartHandler(event);
    };

    private dragMoveHandler = (event: any): void => {
        this._window.dragMoveHandler(event);
    };

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    protected get interactable(): any {
        if (!this._interactable) {
            this._interactable = interact.default(this.element.nativeElement);
            //this._interactable.styleCursor(false);
        }
        return this._interactable;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    @Input('vi-window-drag-area')
    public set window(value: IWindow) {
        if (value === this._window) {
            return;
        }
        this._window = value as WindowDragable;
        if (this._window) {
            this.commitWindowProperties();
        }
    }

    public get window(): IWindow {
        return this._window;
    }
}
