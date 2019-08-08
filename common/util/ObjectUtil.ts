import * as _ from 'lodash';

export class ObjectUtil {
    //--------------------------------------------------------------------------
    //
    //  Object Methods
    //
    //--------------------------------------------------------------------------

    public static getProperties<U, V extends keyof U | string>(from: U): Array<V> {
        return Object.getOwnPropertyNames(from) as any;
    }

    public static hasOwnProperty<T = any>(data: T, property: keyof T | string): boolean {
        return !_.isNil(data) ? _.hasIn(data, property) : false;
    }

    public static hasOwnProperties<T = any>(data: T, properties: Array<keyof T | string>): boolean {
        if (_.isNil(data)) {
            return false;
        }
        let existProperties = ObjectUtil.getProperties(data);
        return _.every(properties, property => existProperties.includes(property));
    }

    public static sortKeys(data: any): any {
        if (_.isNil(data)) {
            return null;
        }
        if (!_.isObject(data)) {
            return data;
        }

        let keys = Object.keys(data);
        if (_.isEmpty(keys)) {
            return data;
        }

        keys.sort();
        let item = {};
        for (let key of keys) {
            item[key] = data[key];
        }
        return item;
    }

    public static instanceOf(data: any, properties: Array<string>): boolean {
        if (_.isNil(data) || _.isBoolean(data) || data !== Object(data)) {
            return false;
        }
        for (let name of properties) {
            if (!(name in data)) {
                return false;
            }
        }
        return true;
    }

    public static clear(data: any): void {
        if (!_.isObject(data)) {
            return;
        }
        for (let key of ObjectUtil.keys(data)) {
            delete data[key];
        }
    }

    public static keys<U, V extends keyof U>(from: U): Array<V> {
        return Object.getOwnPropertyNames(from) as any;
    }

    public static copyProperties<U, V extends keyof U>(from: U, to: any, includeKeys?: Array<V>, excludeKeys?: Array<V>): any {
        if (_.isNil(from) || _.isNil(to)) {
            return null;
        }

        if (!includeKeys || includeKeys.length === 0) {
            includeKeys = ObjectUtil.keys(from);
        }

        for (let key of includeKeys) {
            if (excludeKeys && excludeKeys.length > 0 && excludeKeys.includes(key)) {
                continue;
            }
            try {
                to[key] = from[key];
            } catch (error) {}
        }
        return to;
    }
}
