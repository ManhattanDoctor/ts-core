import { IsOptional } from 'class-validator';
import * as _ from 'lodash';
import { TraceUtil } from '../trace';
import { FilterableConditions, FilterableSort, IFilterable } from './IFilterable';

export class Filterable<U> implements IFilterable<U> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static transform<U>(item: IFilterable<U>): Filterable<U> {
        if (!item) {
            return item;
        }
        if (!_.isNil(item.conditions)) {
            item.conditions = Filterable.parse(item.conditions, Filterable.transformCondition);
        }
        if (!_.isNil(item.sort)) {
            item.sort = Filterable.parse(item.sort, Filterable.transformSort);
        }
        TraceUtil.addIfNeed(item);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Parse Methods
    //
    // --------------------------------------------------------------------------

    private static check(value: any): any {
        if (_.isEmpty(value)) {
            return value;
        }
        if (_.isString(value)) {
            value = Filterable.check(JSON.parse(value));
        }
        return value;
    }

    private static parse(value: any, transform: (item: any, key: string, value: any) => void): any {
        value = Filterable.check(value);
        if (!value) {
            return value;
        }
        for (let pair of Object.entries(value)) {
            transform(value, pair[0], pair[1]);
        }
        return value;
    }

    private static transformCondition(item: any, key: string, value: any): void {
        if (_.isEmpty(value)) {
            delete item[key];
            return;
        }
    }

    private static transformSort(item: any, key: string, value: any): void {
        return Filterable.transformCondition(item, key, value);
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsOptional()
    conditions?: FilterableConditions<U>;

    @IsOptional()
    sort?: FilterableSort<U>;
}
