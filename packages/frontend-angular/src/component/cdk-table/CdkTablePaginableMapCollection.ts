import { CdkTableDataSource } from './CdkTableDataSource';
import { FilterableDataSourceMapCollection, PaginableDataSourceMapCollection } from '@ts-core/common/map/dataSource';
import { PageEvent, SortDirection } from '@angular/material';
import { CdkTableColumnManager } from './column/CdkTableColumnManager';
import * as _ from 'lodash';

export abstract class CdkTablePaginableMapCollection<U, V> extends PaginableDataSourceMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static sortEventHandler<U, V = any>(collection: FilterableDataSourceMapCollection<U, V>, event: SortEvent<U>): void {
        for (let key of Object.keys(collection.sort)) {
            delete collection.sort[key];
        }

        let value = undefined;
        if (event.direction === 'asc') {
            value = true;
        } else if (event.direction === 'desc') {
            value = false;
        }

        if (value === collection.sort[event.active]) {
            return;
        }
        collection.sort[event.active] = value;
        collection.load();
    }
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

    public sortEventHandler(event: SortEvent<U>): void {
        CdkTablePaginableMapCollection.sortEventHandler(this, event);
    }

    public pageEventHandler(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.load();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public clear(): void {
        super.clear();
        this.columns.valueCache.clear();
        this.columns.classNameCache.clear();
        this.columns.styleNameCache.clear();
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

export interface SortEvent<U> {
    active: keyof U;
    direction: SortDirection;
}
