import * as _ from 'lodash';
import { ICookieStorageOptions } from './ICookieStorageOptions';

export class CookieStorageUtil {
    // --------------------------------------------------------------------------
    //
    // 	Clone Methods
    //
    // --------------------------------------------------------------------------

    public static get(item: ICookieStorageOptions): string {
        return CookieStorageUtil.isValid(item) ? item.service.get(item.name) : null;
    }
    
    public static getObject<T = any>(item: ICookieStorageOptions): T {
        return CookieStorageUtil.isValid(item) ? (item.service.getObject(item.name) as T) : null;
    }

    public static put(item: ICookieStorageOptions, value?: string): void {
        if (CookieStorageUtil.isValid(item)) {
            item.service.update(item.name, value, item.options);
        }
    }

    public static putObject<T = any>(item: ICookieStorageOptions, value?: T): void {
        if (CookieStorageUtil.isValid(item)) {
            item.service.updateObject(item.name, value, item.options);
        }
    }

    public static isValid(item: ICookieStorageOptions): boolean {
        return item && item.service && !_.isEmpty(item.name);
    }
}
