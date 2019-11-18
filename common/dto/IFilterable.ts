import { ITraceable } from '../trace';
import { ObjectUtil } from '../util';

export enum FilterableType {
    EQUAL = 'EQUAL',
    MORE = 'MORE',
    MORE_OR_EQUAL = 'MORE_OR_EQUAL',
    LESS = 'LESS',
    LESS_OR_EQUAL = 'LESS_OR_EQUAL',
    CONTAINS = 'CONTAINS',
    CONTAINS_SENSITIVE = 'CONTAINS_SENSITIVE'
}

export interface IFilterable<U> extends ITraceable {
    sort?: FilterableSort<U>;
    conditions?: FilterableConditions<U>;
}

export interface IFilterableCondition<T = any, P extends keyof T = any> {
    type: FilterableType;
    value: T[P];
}

export const isIFilterableCondition = (value: any): boolean => {
    return ObjectUtil.instanceOf(value, ['type', 'value']);
};

export type FilterableSort<T> = { [P in keyof T]?: boolean };
export type FilterableConditions<T> = { [P in keyof T]?: T[P] | Array<T[P]> | IFilterableCondition<T, P> };
