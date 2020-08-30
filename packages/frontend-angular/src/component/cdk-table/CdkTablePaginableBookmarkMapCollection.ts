import { PaginableBookmarkDataSourceMapCollection } from '@ts-core/common/map/dataSource';
import { CdkTableDataSource } from './CdkTableDataSource';

export abstract class CdkTablePaginableBookmarkMapCollection<U, V> extends PaginableBookmarkDataSourceMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _table: CdkTableDataSource<U>;

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        super.initialize();
        this._table = this.getTable();
    }

    protected getTable(): CdkTableDataSource<U> {
        return new CdkTableDataSource(this);
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

    public get table(): CdkTableDataSource<U> {
        return this._table;
    }
}
