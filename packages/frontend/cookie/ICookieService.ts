import { ICookieOptions } from './ICookieOptions';

export interface ICookieService {
    get(key: string): string;
    getObject(key: string): Object;
    getAll(): Object;
    put(key: string, value: string, options?: ICookieOptions): void;
    putObject(key: string, value: Object, options?: ICookieOptions): void;
    remove(key: string, options?: ICookieOptions): void;
    removeAll(options?: ICookieOptions): void;
    update(key: string, value: string, options?: ICookieOptions): void;
    updateObject(key: string, value: Object, options?: ICookieOptions): void;
}
