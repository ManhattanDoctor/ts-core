import * as _ from 'lodash';
import { IPage } from '../../dto/IPage';
import { IPaginable } from '../../dto/IPaginable';
import { IPagination } from '../../dto/IPagination';
import { FilterableDataSourceMapCollection } from './FilterableDataSourceMapCollection';

export abstract class PaginableDataSourceMapCollection<U, V = any> extends FilterableDataSourceMapCollection<U, IPagination<V>> implements IPage {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _total: number;
    protected _pages: number;
    protected _pageSize: number = 10;
    protected _pageIndex: number = 0;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public reload(): Promise<void> {
        this._pageIndex = 0;
        return super.reload();
    }

    public destroy(): void {
        super.destroy();
        this._pageSize = null;
        this._pageIndex = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected createRequestData(): IPaginable<U> {
        let params: IPaginable<U> = super.createRequestData() as any;
        params.pageIndex = this.pageIndex;
        params.pageSize = this.pageSize;
        return params;
    }

    protected parseResponse(response: IPagination<V>): void {
        this._total = response.total;
        this._pages = response.pages;
        this._pageSize = response.pageSize;
        this._pageIndex = response.pageIndex;
        super.parseResponse(response);
    }

    protected getResponseItems(response: IPagination<V>): Array<V> {
        return !_.isNil(response) ? response.items : null;
    }

    protected isAbleToLoad(): boolean {
        if (this.pageIndex > this.pages - 1) {
            return false;
        }
        return !this.isLoading;
    }

    protected checkIsAllLoaded(response: IPagination<V>, items: Array<any>): void {
        this._isAllLoaded = this.pageIndex >= this.pages - 1 || this.pageSize > items.length;
    }

    protected isNeedClearAfterLoad(response: IPagination<V>): boolean {
        return true;
    }

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

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

    public get pages(): number {
        return this._pages;
    }

    public get total(): number {
        return this._total;
    }
}
