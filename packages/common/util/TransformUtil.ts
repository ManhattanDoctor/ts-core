import { classToPlain, ClassTransformOptions, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import * as _ from 'lodash';
import { DateUtil } from './DateUtil';
import { ObjectUtil } from './ObjectUtil';

export class TransformUtil {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public static ENCODING: BufferEncoding = 'utf8';

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

    public static fromJSONMany(items: Array<any>): Array<string> {
        return items.map(item => TransformUtil.fromJSON(item));
    }

    public static toJSON(item: string): any {
        return ObjectUtil.isJSON(item) ? JSON.parse(item) : null;
    }

    public static toJSONMany(items: Array<string>): Array<any> {
        return items.map(item => TransformUtil.toJSON(item));
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

    public static fromClassMany<V = any, U = any>(items: Array<U>, options?: ClassTransformOptions): Array<V> {
        return items.map(item => TransformUtil.fromClass(item, options));
    }

    public static fromClassBuffer<U = any>(item: U, options?: ClassTransformOptions): Buffer {
        let value = TransformUtil.fromJSON(TransformUtil.fromClass(item, options));
        return !_.isNil(value) ? Buffer.from(value, TransformUtil.ENCODING) : null;
    }

    public static fromClassBufferMany<U = any>(items: Array<U>, options?: ClassTransformOptions): Array<Buffer> {
        return items.map(item => TransformUtil.fromClassBuffer(item, options));
    }

    public static toClass<U, V = any>(type: ClassType<U>, item: V, options?: ClassTransformOptions): U {
        return !_.isNil(item) ? plainToClass<U, any>(type, item, options) : null;
    }

    public static toClassMany<U, V = any>(type: ClassType<U>, items: Array<V>, options?: ClassTransformOptions): Array<U> {
        return items.map(item => TransformUtil.toClass(type, item, options));
    }

    public static toClassBuffer<U>(type: ClassType<U>, item: Buffer, options?: ClassTransformOptions): U {
        let value = TransformUtil.toJSON(item.toString(TransformUtil.ENCODING));
        return !_.isNil(value) ? TransformUtil.toClass(type, value, options) : null;
    }

    public static toClassBufferMany<U>(type: ClassType<U>, items: Array<Buffer>, options?: ClassTransformOptions): Array<U> {
        return items.map(item => TransformUtil.toClassBuffer(type, item, options));
    }
}
