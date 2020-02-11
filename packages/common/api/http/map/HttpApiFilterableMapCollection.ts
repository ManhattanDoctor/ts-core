import * as _ from 'lodash';
import { FilterableConditions, FilterableSort, IFilterable } from '../../../dto';
import { HttpApiLoadableMapCollection } from './HttpApiLoadableMapCollection';

export abstract class HttpApiFilterableMapCollection<U, V> extends HttpApiLoadableMapCollection<U, V> {
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
        return this.requestMethod.toLowerCase() === 'get' ? JSON.stringify(param) : param;
    }

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

        this._sort = null;
        this._conditions = null;

        this._items = null;
        this._length = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get items(): Array<U> {
        return this._items;
    }

    public get sort(): FilterableSort<U> {
        return this._sort;
    }

    public get conditions(): FilterableConditions<U> {
        return this._conditions;
    }
}
