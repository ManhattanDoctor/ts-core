import { ITraceable } from '../trace';
import { DateUtil, ObjectUtil } from '../util';
import * as _ from 'lodash';
import { Filterable } from './Filterable';

// --------------------------------------------------------------------------
//
//  Enum
//
// --------------------------------------------------------------------------

export let FilterableConditionRegExp = /[<=>]/g;

export enum FilterableConditionType {
    EQUAL = 'EQUAL',
    MORE = 'MORE',
    MORE_OR_EQUAL = 'MORE_OR_EQUAL',
    LESS = 'LESS',
    LESS_OR_EQUAL = 'LESS_OR_EQUAL',
    CONTAINS = 'CONTAINS',
    CONTAINS_SENSITIVE = 'CONTAINS_SENSITIVE'
}

export enum FilterableDataType {
    DATE = 'DATE',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN'
}

// --------------------------------------------------------------------------
//
//  Interface
//
// --------------------------------------------------------------------------

export interface IFilterable<U> extends ITraceable {
    sort?: FilterableSort<U>;
    conditions?: FilterableConditions<U>;
}

export interface IFilterableCondition<T = any, P extends keyof T = any> {
    condition: FilterableConditionType;
    type?: FilterableDataType;
    value: T[P] | number | string;
}

// --------------------------------------------------------------------------
//
//  Type
//
// --------------------------------------------------------------------------

export type FilterableSort<T> = { [P in keyof T]?: boolean };
export type FilterableConditions<T> = { [P in keyof T]?: T[P] | Array<T[P]> | IFilterableCondition<T, P> };

// --------------------------------------------------------------------------
//
//  Function
//
// --------------------------------------------------------------------------

export const IsFilterableCondition = <T, P extends keyof T>(value: any): value is IFilterableCondition<T, P> => {
    return ObjectUtil.instanceOf(value, ['condition', 'value']);
};

export const ToFilterableCondition = <T, P extends keyof T>(
    value: string,
    type: FilterableDataType,
    defaultCondition: FilterableConditionType
): IFilterableCondition<T, P> => {
    if (Filterable.isValueInvalid(value)) {
        return null;
    }

    let condition = defaultCondition;
    if (type === FilterableDataType.STRING) {
        switch (condition) {
            case FilterableConditionType.CONTAINS:
            case FilterableConditionType.CONTAINS_SENSITIVE:
                value = `%${value}%`;
                break;
        }
        return { value, type, condition };
    }

    let item: string | number = RemoveFilterableCondition(value);
    switch (type) {
        case FilterableDataType.NUMBER:
            item = Number(item);
            break;
        case FilterableDataType.DATE:
            item = Date.parse(item);
            break;
    }

    return { value: item, type, condition: GetFilterableConditionType(value, defaultCondition) };
};

export const GetFilterableCondition = (value: string): string => {
    if (_.isNil(value)) {
        return null;
    }
    let array = value.trim().match(FilterableConditionRegExp);
    return !_.isEmpty(array) ? array[0] : null;
};

export const GetFilterableConditionType = (value: string, defaultCondition: FilterableConditionType): FilterableConditionType => {
    if (_.isNil(value)) {
        return defaultCondition;
    }
    let condition = null;
    switch (GetFilterableCondition(value)) {
        case '=':
            condition = FilterableConditionType.EQUAL;
            break;
        case '>':
            condition = FilterableConditionType.MORE;
            break;
        case '<':
            condition = FilterableConditionType.LESS;
            break;
        default:
            condition = defaultCondition;
    }
    return condition;
};

export const RemoveFilterableCondition = (value: string): string => {
    return _.isString(value) ? value.replace(FilterableConditionRegExp, '').trim() : value;
};

export const ParseFilterableCondition = <T, P extends keyof T>(
    conditions: FilterableConditions<T>,
    name: P,
    type: FilterableDataType,
    defaultCondition: FilterableConditionType = FilterableConditionType.EQUAL,
    transform?: (item: T[P], conditions: FilterableConditions<T>, name: P) => string
): void => {
    if (_.isEmpty(conditions) || _.isNil(name) || !ObjectUtil.hasOwnProperty(conditions, name)) {
        return;
    }
    let value: any = conditions[name];
    if (!_.isNil(value)) {
        value = !_.isNil(transform) ? transform(value, conditions, name) : value.toString();
    }

    let item = ToFilterableCondition<T, P>(value, type, defaultCondition);
    if (!_.isNil(item)) {
        conditions[name] = item;
    } else {
        delete conditions[name];
    }
};
