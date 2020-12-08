import * as _ from 'lodash';
import { FilterableConditions, FilterableSort, IFilterable } from '../../dto/IFilterable';
import { DataSourceMapCollection } from './DataSourceMapCollection';

export abstract class FilterableDataSourceMapCollection<U, V = any> extends DataSourceMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _sort: FilterableSort<U> = {};
    protected _conditions: FilterableConditions<U> = {};

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected createRequestData(): IFilterable<U> {
        let data: IFilterable<U> = {};
        if (!_.isEmpty(this.sort)) {
            data.sort = this.sort;
        }
        if (!_.isEmpty(this.conditions)) {
            data.conditions = this.conditions;
        }
        return data;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async reload(): Promise<void> {
        this.setLength(0);
        return super.reload();
    }

    public destroy(): void {
        super.destroy();

        this._sort = null;
        this._conditions = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get sort(): FilterableSort<U> {
        return this._sort;
    }

    public get conditions(): FilterableConditions<U> {
        return this._conditions;
    }
}
