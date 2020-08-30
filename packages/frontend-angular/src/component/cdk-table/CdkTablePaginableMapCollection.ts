import { CdkTableDataSource } from './CdkTableDataSource';
import { PaginableDataSourceMapCollection } from '@ts-core/common/map/dataSource';
import { PageEvent, SortDirection } from '@angular/material';

export abstract class CdkTablePaginableMapCollection<U, V> extends PaginableDataSourceMapCollection<U, V> {
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
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    public sortEventHandler(event: SortEvent<U>): void {
        for (let key of Object.keys(this.sort)) {
            delete this.sort[key];
        }

        let value = undefined;
        if (event.direction === 'asc') {
            value = true;
        } else if (event.direction === 'desc') {
            value = false;
        }

        if (value === this.sort[event.active]) {
            return;
        }
        this.sort[event.active] = value;
        this.load();
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

export interface SortEvent<U> {
    active: keyof U;
    direction: SortDirection;
}
