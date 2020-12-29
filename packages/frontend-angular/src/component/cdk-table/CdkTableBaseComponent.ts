import { EventEmitter, Input, Output } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import * as _ from 'lodash';
import { ICdkTableColumn } from './column/ICdkTableColumn';
import { CdkTablePaginableMapCollection } from './CdkTablePaginableMapCollection';
import { CdkTableFilterableMapCollection } from './CdkTableFilterableMapCollection';
import { SortDirection } from '@angular/material';
import { FilterableDataSourceMapCollection } from '@ts-core/common/map/dataSource';

export abstract class CdkTableBaseComponent<
    T extends CdkTablePaginableMapCollection<U, V> | CdkTableFilterableMapCollection<U, V>,
    U,
    V,
    S = ICdkTableSettings
> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _table: T;
    protected _settings: S;
    protected _columns: Array<ICdkTableColumn<U>>;
    protected _columnNames: Array<keyof U>;

    @Output()
    public rowClicked: EventEmitter<U>;
    @Output()
    public cellClicked: EventEmitter<ICdkTableCellEvent<U>>;

    public sortActive: keyof U;
    public sortDirection: SortDirection;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(settings?: S) {
        super();

        this._settings = settings;
        this._columnNames = [];
        this.rowClicked = new EventEmitter();
        this.cellClicked = new EventEmitter();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitTableProperties(): void {
        let sort = CdkTablePaginableMapCollection.getSort(this.table as FilterableDataSourceMapCollection<U, V>);
        if (!_.isNil(sort)) {
            this.sortActive = sort.active;
            this.sortDirection = sort.direction;
        }

        if (!_.isEmpty(this.table.columns.items)) {
            this.columns = this.table.columns.items;
        }

        if (!this.table.isDirty) {
            this.table.reload();
        }
    }

    protected commitColumnsProperties(): void {
        let value = null;

        value = !_.isEmpty(this.columns) ? this.columns.map(item => item.name) : [];
        if (value !== this._columnNames) {
            this._columnNames = value;
        }
    }

    protected commitSettingsProperties(): void {}

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        this.table = null;
        if (!_.isNil(this.cellClicked)) {
            this.cellClicked.complete();
            this.cellClicked = null;
        }
        if (!_.isNil(this.rowClicked)) {
            this.rowClicked.complete();
            this.rowClicked = null;
        }
    }

    //--------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    //--------------------------------------------------------------------------

    public cellClickHandler(item: U, column: ICdkTableColumn<U>): void {
        this.cellClicked.emit({ data: item, column: column.name });
        this.rowClicked.emit(item);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get table(): T {
        return this._table;
    }
    @Input()
    public set table(value: T) {
        if (value === this._table) {
            return;
        }
        this._table = value;
        if (!_.isNil(value)) {
            this.commitTableProperties();
        }
    }

    public get columns(): Array<ICdkTableColumn<U>> {
        return this._columns;
    }
    @Input()
    public set columns(value: Array<ICdkTableColumn<U>>) {
        if (value === this._columns) {
            return;
        }
        this._columns = value;
        if (!_.isNil(value)) {
            this.commitColumnsProperties();
        }
    }

    public get settings(): S {
        return this._settings;
    }
    @Input()
    public set settings(value: S) {
        if (value === this._settings) {
            return;
        }
        this._settings = value;
        if (!_.isNil(value)) {
            this.commitSettingsProperties();
        }
    }

    public get columnNames(): Array<keyof U> {
        return this._columnNames;
    }
}

export interface ICdkTableCellEvent<U> {
    data: U;
    column: keyof U;
}

export interface ICdkTableSettings {
    noDataId?: string;
    isInteractive?: boolean;
}
