import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { DestroyableContainer } from '@ts-core/common';

import * as _ from 'lodash';
import { ISelectListItem } from '../../list/select/ISelectListItem';
import { SelectListItems } from '../../list/select/SelectListItems';

@Component({
    selector: 'vi-tab-group',
    templateUrl: 'tab-group.component.html'
})
export class TabGroupComponent<T = any> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    @Input()
    public className: string;
    protected _list: SelectListItems<ISelectListItem<T>>;

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitListProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    public selectedTabChange(event: MatTabChangeEvent): void {
        if (_.isNil(this.list)) {
            return;
        }
        let index = event.index;
        if (index < 0 || index >= this.list.length) {
            return;
        }
        let item = this.list.collection[index];
        this.list.selectedItem = item;
        this.list.actionItem(item);
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
        this.list = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get list(): SelectListItems<ISelectListItem<T>> {
        return this._list;
    }
    @Input()
    public set list(value: SelectListItems<ISelectListItem<T>>) {
        if (value === this._list) {
            return;
        }
        this._list = value;
        if (!_.isNil(value)) {
            this.commitListProperties();
        }
    }
}
