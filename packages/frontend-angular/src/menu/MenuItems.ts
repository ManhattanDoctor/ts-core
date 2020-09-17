import { DestroyableContainer, LoadableEvent } from '@ts-core/common';
import { ArrayUtil } from '@ts-core/common/util';
import { LanguageService } from '@ts-core/frontend/language';
import { filter, takeUntil } from 'rxjs/operators';
import { MenuItem } from './MenuItem';
import { MenuItemBase } from './MenuItemBase';

export class MenuItems extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _items: Array<MenuItemBase>;
    protected _enabledItems: Array<MenuItemBase>;
    protected filterFunction: (item: MenuItemBase) => boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private language: LanguageService, filterFunction?: (item: MenuItem) => boolean, isAutoTranslate: boolean = false) {
        super();

        this._items = [];
        this._enabledItems = [];
        this.filterFunction = filterFunction;

        language.completed
            .pipe(
                filter(() => isAutoTranslate),
                takeUntil(this.destroyed)
            )
            .subscribe(() => this.translateItems(this._items));
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private translateItems(items: Array<MenuItemBase>): void {
        for (let item of items) {
            this.translateItem(item);
        }
    }

    private translateItem(item: MenuItemBase): void {
        item.name = this.language.translate(item.nameId);
    }

    private checkEnabledItems(items: Array<MenuItemBase>): boolean {
        ArrayUtil.sort(items);
        let isMainItems = items === this._items;
        let isAllEnabled = true;

        if (isMainItems) {
            ArrayUtil.clear(this._enabledItems);
        }

        for (let item of items) {
            if (!item.name && item.nameId) {
                this.translateItem(item);
            }

            let isEnabled = item.checkEnabled ? item.checkEnabled(item) : true;
            if (isEnabled && this.filterFunction) {
                isEnabled = this.filterFunction(item);
            }

            item.isEnabled = isEnabled;
            if (isEnabled) {
                this._enabledItems.push(item);
            }

            if (isAllEnabled && !isEnabled) {
                isAllEnabled = false;
            }
        }
        return isAllEnabled;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public add(item: MenuItemBase): MenuItemBase {
        this._items.push(item);
        return item;
    }

    public remove(item: MenuItemBase): MenuItemBase {
        let index = this._items.indexOf(item);
        if (index > -1) {
            this._items.slice(index, 1);
        }
        return item;
    }

    public checkEnabled(...args): boolean {
        return this.checkEnabledItems(this._items);
    }

    // --------------------------------------------------------------------------
    //
    // 	Interface Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this._items = null;
        this._enabledItems = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get items(): Array<MenuItemBase> {
        return this._items;
    }

    public get enabledItems(): Array<MenuItemBase> {
        return this._enabledItems;
    }
}
