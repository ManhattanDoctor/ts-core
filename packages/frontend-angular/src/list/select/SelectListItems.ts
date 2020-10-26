import * as _ from 'lodash';
import { ISelectListItem } from './ISelectListItem';
import { ListItems } from '../ListItems';
import { LanguageService } from '@ts-core/frontend/language';

export class SelectListItems<U extends ISelectListItem<V>, V = any> extends ListItems<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _selectedItem: U;
    protected _selectedData: V;
    protected _selectedIndex: number;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(language: LanguageService, isAutoTranslate: boolean = true) {
        super(language, isAutoTranslate);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitSelectedItemProperties(): void {
        this.selectedIndex = !_.isNil(this.selectedItem) ? this.selectedItem.sortIndex : null;
        this._selectedData = !_.isNil(this.selectedItem) ? this.selectedItem.data : null;
    }

    protected commitSelectedIndexProperties(): void {
        this.selectedItem = !_.isNil(this.selectedIndex) ? _.find(this.collection, item => item.sortIndex === this.selectedIndex) : null;
    }

    protected checkSelection(...params): void {
        if (_.isEmpty(this.collection)) {
            return;
        }

        for (let item of this._collection) {
            item.isSelected = !_.isNil(item.checkSelected) ? item.checkSelected(item, ...params) : false;
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get selectedData(): V {
        return this._selectedData;
    }

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

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public complete(selectedIndex?: number): void {
        super.complete();
        this.selectedIndex = selectedIndex;
    }

    public refresh(...params): void {
        super.refresh(...params);
        this.checkSelection(...params);
    }

    public destroy(): void {
        super.destroy();
        this.selectedIndex = null;
    }
}
