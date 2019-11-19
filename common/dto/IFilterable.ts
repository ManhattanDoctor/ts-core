import { ITraceable } from '../trace';
import { ObjectUtil } from '../util';

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
    BOOLEAN = 'BOOLEAN',
}

export interface IFilterable<U> extends ITraceable {
    sort?: FilterableSort<U>;
    conditions?: FilterableConditions<U>;
}

export interface IFilterableCondition<T = any, P extends keyof T = any> {
    condition: FilterableConditionType;
    type?: FilterableDataType;
    value: T[P];
}

export const isIFilterableCondition = (value: any): boolean => {
    return ObjectUtil.instanceOf(value, ['condition', 'value']);
};

export type FilterableSort<T> = { [P in keyof T]?: boolean };
export type FilterableConditions<T> = { [P in keyof T]?: T[P] | Array<T[P]> | IFilterableCondition<T, P> };
