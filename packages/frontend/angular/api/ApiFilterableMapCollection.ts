import * as _ from 'lodash';
import { FilterableConditions, FilterableSort, IFilterable } from '@ts-core/common/dto';
import { ApiMethod } from '../../api';
import { ApiLoadableMapCollection } from './ApiLoadableMapCollection';

export abstract class ApiFilterableMapCollection<U, V> extends ApiLoadableMapCollection<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _items: Array<U>;

    protected _sort: FilterableSort<U> = {};
    protected _conditions: FilterableConditions<U> = {};

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public reload(): void {
        this._items = [];
        this._length = 0;
        super.reload();
    }

    public destroy(): void {
        super.destroy();
        this._items = null;
        this._length = null;
        this._conditions = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getParamsForRequest(): IFilterable<V> {
        let params: IFilterable<V> = {};

        if (!_.isEmpty(this.sort)) {
            params.sort = this.parseParamForRequest(this.sort);
        }
        if (!_.isEmpty(this.conditions)) {
            params.conditions = this.parseParamForRequest(this.conditions);
        }
        return params;
    }

    protected parseParamForRequest(param: any): any {
        return this.requestMethod === ApiMethod.GET ? JSON.stringify(param) : param;
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

    public get items(): Array<U> {
        return this._items;
    }
}
