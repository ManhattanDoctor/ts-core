import { ApiResponse } from '@ts-core/common/api';
import { HttpApiFilterableMapCollection } from '@ts-core/common/api/http/map';
import { LocalDataSource } from 'ng2-smart-table';
import { TableDataSource } from './TableDataSource';

export abstract class TableMapCollection<U, V> extends HttpApiFilterableMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _table: TableDataSource<U>;
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

    protected parseResponse(response: ApiResponse<V>): void {
        this.clear();
        super.parseResponse(response);
    }

    protected getTable(): TableDataSource<U> {
        return new TableDataSource(this);
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
            return;
        }
        super.load();
    }

    public destroy(): void {
        super.destroy();
        this._table = null;
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
