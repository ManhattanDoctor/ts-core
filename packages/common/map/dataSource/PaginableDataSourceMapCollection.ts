import * as _ from 'lodash';
import { IPage } from '../../dto/IPage';
import { IPaginable } from '../../dto/IPaginable';
import { IPagination } from '../../dto/IPagination';
import { DataSourceMapCollection } from './DataSourceMapCollection';
import { FilterableDataSourceMapCollection } from './FilterableDataSourceMapCollection';

export abstract class PaginableDataSourceMapCollection<U, V> extends FilterableDataSourceMapCollection<U, IPagination<V>> implements IPage {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static getResponseItems<T>(response: T): Array<any> {
        return !_.isNil(response) ? DataSourceMapCollection.getResponseItems((response as any).items) : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _items: Array<U>;

    protected _total: number;
    protected _pages: number;
    protected _pageSize: number = 10;
    protected _pageIndex: number = 0;

    public isClearAfterLoad: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public reload(): Promise<void> {
        this._items = [];
        this._pageIndex = 0;
        return super.reload();
    }

    public destroy(): void {
        super.destroy();
        this._items = null;
        this._pageSize = null;
        this._pageIndex = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected createRequestData(): IPaginable<U> {
        let params: IPaginable<V> = super.createRequestData() as any;
        params.pageIndex = this.pageIndex;
        params.pageSize = this.pageSize;
        return params as any;
    }

    protected parseResponse(response: IPagination<V>): void {
        super.parseResponse(response);
        let items = this.getResponseItems(response);
        this._total = response.total;
        this._pages = response.pages;
        this._isAllLoaded = _.isEmpty(items);

        if (this._isAllLoaded) {
            return;
        }

        if (this.isClearAfterLoad) {
            this.clear();
        }

        this.parseItems(items);
        this.checkIsAllLoaded(response, items);
    }

    protected checkIsAllLoaded(response: IPagination<V>, items: Array<any>): void {
        this._isAllLoaded = !this.isClearAfterLoad && (response.pageIndex >= response.pages - 1 || response.pageSize > items.length);
    }

    protected getResponseItems(response: IPagination<V>): Array<any> {
        return PaginableDataSourceMapCollection.getResponseItems(response);
    }

    protected commitPageSizeProperties(): void {}

    protected commitPageIndexProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get pageSize(): number {
        return this._pageSize;
    }

    public set pageSize(value: number) {
        if (value === this._pageSize || !_.isNumber(value)) {
            return;
        }
        this._pageSize = value;
        this.commitPageSizeProperties();
    }

    public get pageIndex(): number {
        return this._pageIndex;
    }

    public set pageIndex(value: number) {
        if (value === this._pageIndex || !_.isNumber(value)) {
            return;
        }
        this._pageIndex = value;
        this.commitPageIndexProperties();
    }

    public get items(): Array<U> {
        return this._items;
    }

    public get pages(): number {
        return this._pages;
    }

    public get total(): number {
        return this._total;
    }
}
