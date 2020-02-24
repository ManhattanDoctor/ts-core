import { PaginableDataSourceMapCollection } from '@ts-core/common/map/dataSource';
import { SmartTableDataSource } from './SmartTableDataSource';

export abstract class SmartTablePaginableMapCollection<U, V> extends PaginableDataSourceMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _table: SmartTableDataSource<U>;
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

    protected getTable(): SmartTableDataSource<U> {
        return new SmartTableDataSource(this);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

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

    public get table(): SmartTableDataSource<U> {
        return this._table;
    }
}
