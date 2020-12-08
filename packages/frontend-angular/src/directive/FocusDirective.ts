import { Directive, ElementRef, Input } from '@angular/core';
import { Destroyable } from '@ts-core/common';
import * as _ from 'lodash';
import { FocusManager } from '../manager/FocusManager';

@Directive({
    selector: '[vi-focus]'
})
export class FocusDirective<T = any> extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private manager: FocusManager;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef) {
        super();
        this.manager = new FocusManager(element);
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected focus = (): void => {
        this.manager.focus();
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

        if (!_.isNil(this.manager)) {
            this.manager.destroy();
            this.manager = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    @Input('vi-focus')
    public set trigger(value: T) {
        this.focus();
    }
}
