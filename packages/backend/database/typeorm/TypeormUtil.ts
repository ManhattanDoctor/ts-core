import {
    FilterableConditions,
    FilterableConditionType,
    FilterableSort,
    IFilterable,
    IPaginable,
    IPagination,
    isIFilterableCondition
} from '@ts-core/common/dto';
import { ExtendedError } from '@ts-core/common/error';
import { PromiseHandler } from '@ts-core/common/promise';
import { ObjectUtil } from '@ts-core/common/util';
import { validateOrReject } from 'class-validator';
import { ValidatorOptions } from 'class-validator/validation/ValidatorOptions';
import * as fs from 'fs';
import * as _ from 'lodash';
import { Connection, ConnectionOptions, QueryFailedError, SelectQueryBuilder } from 'typeorm';

export class TypeormUtil {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static POSTGRE_FORIN_MAX = 10000;

    // --------------------------------------------------------------------------
    //
    //  Query Private Static Methods
    //
    // --------------------------------------------------------------------------

    private static applyConditions<U, T>(query: SelectQueryBuilder<U>, conditions: FilterableConditions<T>): SelectQueryBuilder<U> {
        if (!conditions) {
            return query;
        }

        for (let key of Object.keys(conditions)) {
            let value = conditions[key];
            let property = `${query.alias}.${key}`;
            if (_.isArray(value)) {
                query.andWhere(`${property} IN (:...${key})`, { [key]: value });
                continue;
            }

            if (!isIFilterableCondition(value)) {
                query.andWhere(`${property} = :${key}`, { [key]: value });
                continue;
            }

            let conditionKey = `:${key}`;
            switch (value.condition) {
                case FilterableConditionType.CONTAINS:
                    property = `LOWER(${property})`;
                    conditionKey = `LOWER(${conditionKey})`;
                    break;
            }

            let condition = this.getConditionByType(value.condition);
            query.andWhere(`${property} ${condition} ${conditionKey}`, { [key]: value.value });
        }
        return query;
    }

    private static getConditionByType(item: FilterableConditionType): string {
        switch (item) {
            case FilterableConditionType.EQUAL:
                return '=';
            case FilterableConditionType.MORE:
                return '>';
            case FilterableConditionType.MORE_OR_EQUAL:
                return '>=';
            case FilterableConditionType.LESS:
                return '<';
            case FilterableConditionType.LESS_OR_EQUAL:
                return '<=';
            case FilterableConditionType.CONTAINS:
            case FilterableConditionType.CONTAINS_SENSITIVE:
                return 'like';
        }
        throw new ExtendedError(`Invalid condition type ${item}`);
    }

    private static applySort<U, T>(query: SelectQueryBuilder<U>, sort: FilterableSort<T>): SelectQueryBuilder<U> {
        if (!sort) {
            return query;
        }
        for (let key of Object.keys(sort)) {
            query.addOrderBy(`${query.alias}.${key}`, sort[key] ? 'ASC' : 'DESC', 'NULLS LAST');
        }
        return query;
    }

    // --------------------------------------------------------------------------
    //
    //  Query Static Methods
    //
    // --------------------------------------------------------------------------

    public static applyFilters<U, T>(query: SelectQueryBuilder<U>, params: IFilterable<T>): SelectQueryBuilder<U> {
        if (ObjectUtil.instanceOf(params, ['conditions'])) {
            TypeormUtil.applyConditions(query, params.conditions);
        }
        if (ObjectUtil.instanceOf(params, ['sort'])) {
            TypeormUtil.applySort(query, params.sort);
        }
        return query;
    }

    public static async toPagination<U, V, T>(
        query: SelectQueryBuilder<U>,
        params: IPaginable<T>,
        transform: (item: U) => Promise<V>
    ): Promise<IPagination<V>> {
        query = TypeormUtil.applyFilters(query, params);
        query = query.skip(params.pageSize * params.pageIndex).take(params.pageSize);

        let total = await query.getCount();
        let pages = Math.ceil(total / params.pageSize);

        let many = await query.getMany();
        let items: Array<V> = [];
        for (let item of many) {
            items.push(await transform(item));
        }

        return { pages, total, items, pageSize: params.pageSize, pageIndex: params.pageIndex };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static async databaseClear(connection: Connection, name: string): Promise<void> {
        let queryRunner = connection.createQueryRunner();
        // await queryRunner.dropDatabase(name, true);
        await connection.synchronize(true);
    }

    public static isEntityId(id: any): boolean {
        if (!_.isNumber(id)) {
            id = parseInt(id, 10);
        }
        return !_.isNaN(id) ? id > 0 : false;
    }

    public static isUniqueError(error: QueryFailedError): boolean {
        return TypeormUtil.isErrorCode(error, TypeormPostgreError.UNIQUE_VIOLATION);
    }

    public static isSerializationError(error: QueryFailedError): boolean {
        return TypeormUtil.isErrorCode(error, TypeormPostgreError.SERIALIZATION_FAILURE);
    }

    public static async generateOrmConfig(config: ConnectionOptions, path: string): Promise<void> {
        let data = JSON.stringify(config);
        data = data.replace(/:\"migration\"/i, ':"src/migration"');
        let promise = PromiseHandler.create();
        fs.writeFile(path + '/ormconfig.json', data, error => {
            if (error) {
                promise.reject(error.toString());
            } else {
                promise.resolve();
            }
        });
        return promise.promise;
    }

    public static async validateEntity(entity: any, options?: ValidatorOptions): Promise<void> {
        await validateOrReject(entity, options);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private static isErrorCode(error: any, code: any): boolean {
        return error && error.code === code;
    }
}

export enum TypeormPostgreError {
    UNIQUE_VIOLATION = '23505',
    SERIALIZATION_FAILURE = '40001'
}
