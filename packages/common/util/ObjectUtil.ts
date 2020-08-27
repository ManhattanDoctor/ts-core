import * as _ from 'lodash';

export class ObjectUtil {
    // --------------------------------------------------------------------------
    //
    //  Object Methods
    //
    // --------------------------------------------------------------------------

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

    public static sortKeys<T>(data: T, isDeep?: boolean): any {
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

        keys.sort((first, second) => {
            first = first.toLowerCase();
            second = second.toLowerCase();
            if (first === second) {
                return 0;
            }
            return first < second ? -1 : 1;
        });

        let item = {};
        for (let key of keys) {
            let value = data[key];
            if (_.isObject(value) && !_.isArray(value)) {
                item[key] = !isDeep ? value : ObjectUtil.sortKeys(value);
            } else {
                item[key] = value;
            }
        }
        return item;
    }

    public static instanceOf<T = any>(data: any, properties: Array<keyof T>): data is T {
        if (_.isNil(data) || _.isBoolean(data) || data !== Object(data)) {
            return false;
        }
        for (let name of properties) {
            if (_.isUndefined(data[name])) {
                return false;
            }
        }
        return true;
    }

    public static clear<U, V extends keyof U>(data: U, excludeKeys?: Array<V>): void {
        if (!_.isObject(data)) {
            return;
        }
        let keys = ObjectUtil.keys(data) as Array<V>;
        if (!_.isEmpty(excludeKeys)) {
            keys = keys.filter(item => !excludeKeys.includes(item));
        }
        ObjectUtil.clearKeys(data, keys);
    }

    public static clearKeys<U, V extends keyof U>(data: U, keys: Array<V>): void {
        if (!_.isObject(data)) {
            return;
        }
        for (let key of keys) {
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

        if (_.isEmpty(includeKeys)) {
            includeKeys = ObjectUtil.keys(from);
        }
        if (!_.isEmpty(excludeKeys)) {
            includeKeys = includeKeys.filter(key => !excludeKeys.includes(key));
        }

        for (let key of includeKeys) {
            try {
                to[key] = from[key];
            } catch (error) {}
        }
        return to;
    }

    public static isJSON(data: string): boolean {
        if (!_.isString(data)) {
            return false;
        }
        try {
            return !_.isNil(JSON.parse(data));
        } catch {
            return false;
        }
    }
}
