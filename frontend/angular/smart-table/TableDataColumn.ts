import * as _ from 'lodash';
import { FilterableType, IFilterableCondition } from '../../../common/dto';
import { ObjectUtil } from '../../../common/util';

export class TableDataColumn<U> {
    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static filterFunction(value: string, defaultType: FilterableType = FilterableType.CONTAINS): IFilterableCondition {
        if (_.isEmpty(value)) {
            return { type: defaultType, value };
        }

        let type = defaultType;
        for (let filter of Object.values(FilterableType)) {
            if (!value.includes(filter)) {
                continue;
            }
            type = filter;
            value = value.replace(filter, '').trim();
        }

        switch (type) {
            case FilterableType.CONTAINS:
            case FilterableType.CONTAINS_SENSITIVE:
                value = `%${value}%`;
                break;
        }
        return { value, type };
    }

    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public name: keyof U;
    public sort?: boolean;
    public class?: string;
    public title?: string;
    public filter?: any;

    public filterFunction?: (value: any) => IFilterableCondition<U>;
    public valuePrepareFunction?: (value: any, data: U) => string;

    public titleId?: string;
    public titleTranslation?: any;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(name: keyof U) {
        this.name = name;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public clone(properties: { [P in keyof TableDataColumn<U>]?: any }): TableDataColumn<U> {
        if (_.isNil(properties)) {
            properties = {};
        }
        let item = new TableDataColumn(this.name);
        for (let name of ['sort', 'class', 'filter', 'filterFunction', 'valuePrepareFunction', 'titleId', 'titleTranslation']) {
            item[name] = ObjectUtil.hasOwnProperty(properties, name) ? properties[name] : this[name];
        }
        return item;
    }
}
