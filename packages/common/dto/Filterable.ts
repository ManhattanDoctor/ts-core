import { IsOptional } from 'class-validator';
import * as _ from 'lodash';
import { TraceUtil } from '../trace';
import { DateUtil } from '../util';
import { FilterableConditions, FilterableDataType, FilterableSort, IFilterable, IFilterableCondition, isIFilterableCondition } from './IFilterable';

export class Filterable<U> implements IFilterable<U> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static transform<U>(item: IFilterable<U>): Filterable<U> {
        if (_.isNil(item)) {
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
    //  Transform Methods
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
        if (isIFilterableCondition(value)) {
            Filterable.transformFilterableCondition(item, key, value);
            return;
        }
        if (Filterable.isConditionValueInvalid(value)) {
            delete item[key];
            return;
        }
    }

    private static transformSort(item: any, key: string, value: any): void {
        return Filterable.transformCondition(item, key, value);
    }

    private static transformFilterableCondition(item: any, key: string, condition: IFilterableCondition): void {
        if (Filterable.isConditionValueInvalid(condition.value)) {
            delete item[key];
            return;
        }
        if (condition.type === FilterableDataType.DATE) {
            condition.value = DateUtil.getDate(condition.value);
        }
    }

    private static isConditionValueInvalid(value: any): boolean {
        return _.isEmpty(value) && !_.isBoolean(value);
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
