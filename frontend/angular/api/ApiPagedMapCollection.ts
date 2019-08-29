import * as _ from 'lodash';
import { IPage, IPaginable, IPagination } from '../../../common/dto';
import { ApiResponse } from '../../api';
import { ApiFilterableMapCollection } from './ApiFilterableMapCollection';

export abstract class ApiPagedMapCollection<U, V> extends ApiFilterableMapCollection<U, IPagination<V>> implements IPage {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    protected _pageSize: number = 10;
    protected _pageIndex: number = 0;

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public reload(): void {
        this._pageIndex = 0;
        super.reload();
    }

    public destroy(): void {
        super.destroy();
        this._pageSize = null;
        this._pageIndex = null;
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected getParamsForRequest(): IPaginable<IPagination<V>> {
        let params: IPaginable<V> = super.getParamsForRequest() as any;
        params.pageIndex = this.pageIndex;
        params.pageSize = this.pageSize;
        return params as any;
    }

    protected parseResponse(response: ApiResponse<IPagination<V>>): void {
        let items = this.getResponseItems(response);
        this._isAllLoaded = items.length === 0;

        if (this.isAllLoaded) {
            return;
        }

        this.parseItems(items);
        this.checkIsAllLoaded(response, items);
    }

    protected checkIsAllLoaded(response: ApiResponse<IPagination<V>>, items: Array<any>): void {
        let pagination: IPagination<V> = response.data;
        this._isAllLoaded = pagination.pageIndex >= pagination.pages - 1 || pagination.pageSize > items.length;
    }

    protected getResponseItems(response: ApiResponse<IPagination<V>>): Array<any> {
        return response.data.items;
    }

    protected commitPageSizeProperties(): void {}

    protected commitPageIndexProperties(): void {}

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get pageSize(): number {
        return this._pageSize;
    }
    public set pageSize(value: number) {
        if (value === this._pageSize || isNaN(value)) {
            return;
        }
        this._pageSize = value;
        this.commitPageSizeProperties();
    }

    public get pageIndex(): number {
        return this._pageIndex;
    }
    public set pageIndex(value: number) {
        if (value === this._pageIndex || _.isNaN(value)) {
            return;
        }
        this._pageIndex = value;
        this.commitPageIndexProperties();
    }

    public get items(): Array<U> {
        return this._items;
    }
}
