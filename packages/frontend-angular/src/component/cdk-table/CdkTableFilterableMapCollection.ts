import { CdkTableDataSource } from './CdkTableDataSource';
import { FilterableDataSourceMapCollection } from '@ts-core/common/map/dataSource';
import { CdkTableColumnManager } from './column/CdkTableColumnManager';
import * as _ from 'lodash';
import { CdkTablePaginableMapCollection, SortData } from './CdkTablePaginableMapCollection';

export abstract class CdkTableFilterableMapCollection<U, V> extends FilterableDataSourceMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _table: CdkTableDataSource<U>;
    protected _columns: CdkTableColumnManager<U>;

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        super.initialize();
        this._table = this.getTable();
        this._columns = this.getColumnManager();
    }

    protected getTable(): CdkTableDataSource<U> {
        return new CdkTableDataSource(this);
    }

    protected getColumnManager(): CdkTableColumnManager<U> {
        return new CdkTableColumnManager(this.uidPropertyName);
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    public sortEventHandler(event: SortData<U>): void {
        CdkTablePaginableMapCollection.sortEventHandler(this, event);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public clear(): void {
        super.clear();
        this.columns.clear();
    }

    public destroy(): void {
        super.destroy();
        if (!_.isNil(this._table)) {
            this._table.destroy();
            this._table = null;
        }
        if (!_.isNil(this._columns)) {
            this._columns.destroy();
            this._columns = null;
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

    public get columns(): CdkTableColumnManager<U> {
        return this._columns;
    }
}
