import * as _ from 'lodash';
import { ICdkTableColumn } from './ICdkTableColumn';
import { DestroyableContainer } from '@ts-core/common';
import { CdkTableColumnValueCache } from './cache/CdkTableColumnValueCache';
import { CdkTableColumnStyleNameCache } from './cache/CdkTableColumnStyleNameCache';
import { CdkTableColumnClassNameCache } from './cache/CdkTableColumnClassNameCache';

export class CdkTableColumnManager<U> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _items: Array<ICdkTableColumn<U>>;

    protected _valueCache: CdkTableColumnValueCache<U>;
    protected _classNameCache: CdkTableColumnClassNameCache<U>;
    protected _styleNameCache: CdkTableColumnStyleNameCache<U>;
    protected _headerStyleNameCache: CdkTableColumnStyleNameCache<U>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(uidPropertyName: keyof U) {
        super();
        this._valueCache = new CdkTableColumnValueCache(uidPropertyName);
        this._classNameCache = new CdkTableColumnClassNameCache(uidPropertyName);
        this._styleNameCache = new CdkTableColumnStyleNameCache(uidPropertyName);
        this._headerStyleNameCache = new CdkTableColumnStyleNameCache(uidPropertyName);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitItemsProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public getValue(item: U, column: ICdkTableColumn<U>): string | number | U[keyof U] {
        return this.valueCache.getValue(item, column);
    }

    public getClass(item: U, column: ICdkTableColumn<U>): string {
        return this.classNameCache.getValue(item, column);
    }

    public getStyle(item: U, column: ICdkTableColumn<U>): { [key: string]: string } {
        return this.styleNameCache.getValue(item, column);
    }

    public getHeaderStyle(item: U, column: ICdkTableColumn<U>): { [key: string]: string } {
        return this.headerStyleNameCache.getValue(item, column);
    }

    public trackBy(index: number, item: ICdkTableColumn<U>): keyof U {
        return item.name;
    }

    public clear(): void {
        this.valueCache.clear();
        this.classNameCache.clear();
        this.styleNameCache.clear();
    }

    public destroy(): void {
        super.destroy();
        if (!_.isNil(this._valueCache)) {
            this._valueCache.destroy();
            this._valueCache = null;
        }
        if (!_.isNil(this._classNameCache)) {
            this._classNameCache.destroy();
            this._classNameCache = null;
        }
        if (!_.isNil(this._styleNameCache)) {
            this._styleNameCache.destroy();
            this._styleNameCache = null;
        }
        if (!_.isNil(this._headerStyleNameCache)) {
            this._headerStyleNameCache.destroy();
            this._headerStyleNameCache = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get valueCache(): CdkTableColumnValueCache<U> {
        return this._valueCache;
    }

    public get styleNameCache(): CdkTableColumnStyleNameCache<U> {
        return this._styleNameCache;
    }

    public get headerStyleNameCache(): CdkTableColumnStyleNameCache<U> {
        return this._headerStyleNameCache;
    }

    public get classNameCache(): CdkTableColumnClassNameCache<U> {
        return this._classNameCache;
    }

    public get items(): Array<ICdkTableColumn<U>> {
        return this._items;
    }
    public set items(value: Array<ICdkTableColumn<U>>) {
        if (value === this._items) {
            return;
        }
        this._items = value;
        if (!_.isNil(value)) {
            this.commitItemsProperties();
        }
    }
}
