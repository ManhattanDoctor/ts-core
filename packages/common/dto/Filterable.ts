import { IsOptional } from 'class-validator';
import * as _ from 'lodash';
import { TraceUtil } from '../trace';
import { DateUtil } from '../util';
import { FilterableConditions, FilterableDataType, FilterableSort, IFilterable, IFilterableCondition, IsFilterableCondition } from './IFilterable';

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

    public static isValueInvalid(value: any): boolean {
        if (_.isBoolean(value) || _.isNull(value)) {
            return false;
        }
        if (_.isNumber(value)) {
            return _.isNaN(value);
        }
        return _.isEmpty(value) || _.isUndefined(value);
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
        if (_.isNil(value)) {
            return value;
        }
        for (let pair of Object.entries(value)) {
            transform(value, pair[0], pair[1]);
        }
        return value;
    }

    public static transformCondition(item: any, key: string, value: any): void {
        if (IsFilterableCondition(value)) {
            Filterable.transformFilterableCondition(item, key, value);
            return;
        }
        if (Filterable.isValueInvalid(value)) {
            delete item[key];
            return;
        }
    }

    public static transformSort(item: any, key: string, value: any): void {
        return Filterable.transformCondition(item, key, value);
    }

    private static transformFilterableCondition(item: any, key: string, condition: IFilterableCondition): void {
        let value = condition.value;
        if (Filterable.isValueInvalid(value)) {
            delete item[key];
            return;
        }
        if (condition.type === FilterableDataType.DATE) {
            if (!_.isNumber(value)) {
                value = parseInt(value, 10);
            }
            if (!_.isNaN(value)) {
                condition.value = DateUtil.getDate(value);
            }
        }
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
