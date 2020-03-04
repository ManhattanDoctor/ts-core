import { classToPlain, ClassTransformOptions, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import * as _ from 'lodash';
import { DateUtil } from './DateUtil';
import { ObjectUtil } from './ObjectUtil';

export class TransformUtil {
    // --------------------------------------------------------------------------
    //
    // 	JSON
    //
    // --------------------------------------------------------------------------

    public static fromJSON(item: any): string {
        if (_.isString(item)) {
            return item;
        }
        return _.isObject(item) ? JSON.stringify(item) : null;
    }

    public static toJSON(item: string): any {
        return ObjectUtil.isJSON(item) ? JSON.parse(item) : item;
    }

    // --------------------------------------------------------------------------
    //
    // 	Date
    //
    // --------------------------------------------------------------------------

    public static fromDate(item: Date): string {
        return _.isDate(item) ? item.getTime().toString() : null;
    }

    public static toDate(item: string): Date {
        return _.isString(item) ? DateUtil.getDate(Number(item)) : null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Class
    //
    // --------------------------------------------------------------------------

    public static fromClass<V = any, U = any>(item: U, options?: ClassTransformOptions): V {
        return !_.isNil(item) ? (classToPlain(item, options) as any) : null;
    }

    public static toClass<U, V = any>(type: ClassType<U>, item: V, options?: ClassTransformOptions): U {
        return !_.isNil(item) ? plainToClass<U, any>(type, item, options) : null;
    }
}
