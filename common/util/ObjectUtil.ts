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
        return !_.isNil(data) ? ObjectUtil.getProperties(data).includes(property) : false;
    }

    public static hasOwnProperties<T = any>(data: T, properties: Array<keyof T | string>): boolean {
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
}
