import { IPagination } from '@common/pagination/IPagination';
import { ApiBaseService, ApiMethod, ApiResponse } from '@ts-core/frontend/api';
import { LocalDataSource } from 'ng2-smart-table';
import { ApiPagedMapCollection } from '../api';
import { TablePagedDataSource } from './TablePagedDataSource';

export abstract class TablePagedMapCollection<U, V> extends ApiPagedMapCollection<U, V> {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    protected _table: TablePagedDataSource<U>;
    protected isNeedTableRefresh: boolean;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(api: ApiBaseService, requestName?: string, requestMethod?: ApiMethod, uidPropertyName?: keyof U) {
        super(api, requestName, requestMethod, uidPropertyName);
        this._table = this.getTable();
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected getTable(): TablePagedDataSource<U> {
        return new TablePagedDataSource(this);
    }

    protected parseResponse(response: ApiResponse<IPagination<V>>): void {
        this.clear();
        super.parseResponse(response);
        this._isAllLoaded = false;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public reload(): void {
        this.isNeedTableRefresh = true;
        super.reload();
    }

    public load(): void {
        if (this.isNeedTableRefresh) {
            this.isNeedTableRefresh = false;
            this.table.refresh();
        } else {
            super.load();
        }
    }

    public destroy(): void {
        super.destroy();
        if (this._table) {
            this._table.destroy();
            this._table = null;
        }
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get table(): LocalDataSource {
        return this._table;
    }
}
