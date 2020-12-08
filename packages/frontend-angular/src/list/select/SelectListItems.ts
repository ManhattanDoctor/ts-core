import * as _ from 'lodash';
import { ISelectListItem } from './ISelectListItem';
import { ListItems } from '../ListItems';
import { LanguageService } from '@ts-core/frontend/language';
import { EventEmitter } from '@angular/core';

export class SelectListItems<U extends ISelectListItem<V>, V = any> extends ListItems<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _selectedItem: U;
    protected _selectedData: V;
    protected _selectedIndex: number;

    protected _changed: EventEmitter<U>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(language: LanguageService, isAutoTranslate: boolean = true) {
        super(language, isAutoTranslate);
        this._changed = new EventEmitter();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitSelectedItemProperties(): void {
        this.selectedData = !_.isNil(this.selectedItem) ? this.selectedItem.data : null;
        this.selectedIndex = !_.isNil(this.selectedItem) ? this.selectedItem.sortIndex : null;

        if (!_.isNil(this.changed)) {
            this.changed.emit(this.selectedItem);
        }
    }

    protected commitSelectedDataProperties(): void {
        this.selectedItem = !_.isNil(this.selectedData) ? _.find(this.collection, item => item.data === this.selectedData) : null;
    }
    protected commitSelectedIndexProperties(): void {
        this.selectedItem = !_.isNil(this.selectedIndex) ? _.find(this.collection, item => item.sortIndex === this.selectedIndex) : null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get selectedItem(): U {
        return this._selectedItem;
    }
    public set selectedItem(value: U) {
        if (value === this._selectedItem) {
            return;
        }
        this._selectedItem = value;
        this.commitSelectedItemProperties();
    }

    public get selectedIndex(): number {
        return this._selectedIndex;
    }
    public set selectedIndex(value: number) {
        if (value === this._selectedIndex) {
            return;
        }
        this._selectedIndex = value;
        this.commitSelectedIndexProperties();
    }

    public get selectedData(): V {
        return this._selectedData;
    }
    public set selectedData(value: V) {
        if (value === this._selectedData) {
            return;
        }
        this._selectedData = value;
        this.commitSelectedDataProperties();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public complete(indexOrDataToSelect?: number | V): void {
        super.complete();
        if (_.isNil(indexOrDataToSelect)) {
            return;
        }
        if (_.isNumber(indexOrDataToSelect)) {
            this.selectedIndex = indexOrDataToSelect;
        } else {
            this.selectedItem = _.find(this.collection, item => item.data === indexOrDataToSelect);
        }
    }

    public refresh(...params): void {
        super.refresh(...params);
        this.refreshSelection(...params);
    }

    public refreshSelection(...params): void {
        if (_.isEmpty(this.collection)) {
            return;
        }
        for (let item of this._collection) {
            item.isSelected = !_.isNil(item.checkSelected) ? item.checkSelected(item, ...params) : false;
            if (item.isSelected) {
                this.selectedItem = item;
            }
        }
    }

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }

        if (!_.isNil(this._changed)) {
            this._changed.complete();
            this._changed = null;
        }
        this.selectedIndex = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get changed(): EventEmitter<U> {
        return this._changed;
    }
}
