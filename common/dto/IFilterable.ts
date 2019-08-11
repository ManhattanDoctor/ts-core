import { ITraceable } from '../trace';

export interface IFilterable<U> extends ITraceable {
    sort?: FilterableSort<U>;
    conditions?: FilterableConditions<U>;
}

export type FilterableSort<T> = { [P in keyof T]?: boolean };
export type FilterableConditions<T> = { [P in keyof T]?: T[P] | Array<T[P]> };
