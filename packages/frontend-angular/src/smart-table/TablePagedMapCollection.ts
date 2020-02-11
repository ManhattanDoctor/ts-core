import { ApiResponse } from '@ts-core/common/api';
import { HttpApiPagedMapCollection } from '@ts-core/common/api/http/map';
import { IPagination } from '@ts-core/common/dto';
import { LocalDataSource } from 'ng2-smart-table';
import { TablePagedDataSource } from './TablePagedDataSource';

export abstract class TablePagedMapCollection<U, V> extends HttpApiPagedMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _table: TablePagedDataSource<U>;
    protected isNeedTableRefresh: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        super.initialize();
        this._table = this.getTable();
    }

    protected getTable(): TablePagedDataSource<U> {
        return new TablePagedDataSource(this);
    }

    protected parseResponse(response: ApiResponse<IPagination<V>>): void {
        this.clear();
        super.parseResponse(response);
        this._isAllLoaded = false;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

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

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get table(): LocalDataSource {
        return this._table;
    }
}
