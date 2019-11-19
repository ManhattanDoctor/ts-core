import * as _ from 'lodash';
import { FilterableConditionType, IFilterableCondition } from '../../../common/dto';
import { ObjectUtil } from '../../../common/util';

export class TableDataColumn<U> {
    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static filterFunction(value: string, defaultCondition: FilterableConditionType = FilterableConditionType.CONTAINS): IFilterableCondition {
        if (_.isEmpty(value)) {
            return { condition: defaultCondition, value };
        }

        let condition = defaultCondition;
        for (let filter of Object.values(FilterableConditionType)) {
            if (!value.includes(TableDataColumn.getConditionType(filter))) {
                continue;
            }
            condition = filter;
            value = value.replace(filter, '').trim();
        }

        switch (condition) {
            case FilterableConditionType.CONTAINS:
            case FilterableConditionType.CONTAINS_SENSITIVE:
                value = `%${value}%`;
                break;
        }
        return { value, condition };
    }

    private static getConditionType(item: string): FilterableConditionType {
        if (item.includes('=')) {
            return FilterableConditionType.EQUAL;
        }
        if (item.includes('>')) {
            return FilterableConditionType.MORE;
        }
        if (item.includes('<')) {
            return FilterableConditionType.LESS;
        }
        return null;
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
