import * as _ from 'lodash';
import { FilterableConditionType, FilterableDataType, IFilterableCondition } from '../../../common/dto';
import { ObjectUtil } from '../../../common/util';

export class TableDataColumn<U> {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static filterFunction(
        value: string,
        type: FilterableDataType = FilterableDataType.STRING,
        condition: FilterableConditionType = FilterableConditionType.CONTAINS
    ): IFilterableCondition {
        if (_.isEmpty(value)) {
            return { condition, value };
        }

        if (type === FilterableDataType.STRING) {
            switch (condition) {
                case FilterableConditionType.CONTAINS:
                case FilterableConditionType.CONTAINS_SENSITIVE:
                    value = `%${value}%`;
                    break;
            }
            return { value, type, condition };
        }

        if (value.includes('=')) {
            condition = FilterableConditionType.EQUAL;
        } else if (value.includes('>')) {
            condition = FilterableConditionType.MORE;
        } else if (value.includes('<')) {
            condition = FilterableConditionType.LESS;
        }
        value = value.replace(/[<=>]/g, '').trim();

        switch (type) {
            case FilterableDataType.NUMBER:
                value = parseFloat(value) as any;
                break;
        }

        console.log(value, type, condition);
        return { value, type, condition };
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
