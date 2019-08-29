import { ApiBaseService, ApiMethod, ApiResponse } from '@ts-core/frontend/api';
import { LocalDataSource } from 'ng2-smart-table';
import { ApiFilterableMapCollection } from '../api';
import { TableDataSource } from './TableDataSource';

export abstract class TableMapCollection<U, V> extends ApiFilterableMapCollection<U, V> {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    protected _table: TableDataSource<U>;
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

    protected parseResponse(response: ApiResponse<V>): void {
        this.clear();
        super.parseResponse(response);
    }

    protected getTable(): TableDataSource<U> {
        return new TableDataSource(this);
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
            return;
        }
        super.load();
    }

    public destroy(): void {
        super.destroy();
        this._table = null;
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
