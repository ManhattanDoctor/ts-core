import * as CacheManager from 'cache-manager';

export abstract class Cache implements CacheManager.Cache {
    abstract set<T>(key: string, value: T, options: CacheManager.CachingConfig, callback?: (error: any) => void): void;
    abstract set<T>(key: string, value: T, ttl: number, callback?: (error: any) => void): void;
    abstract set<T>(key: string, value: T, options: CacheManager.CachingConfig): Promise<any>;
    abstract set<T>(key: string, value: T, ttl: number): Promise<any>;

    abstract wrap<T>(...args: CacheManager.WrapArgsType<T>[]): Promise<any>;

    abstract get<T>(key: string, callback: (error: any, result: T) => void): void;
    abstract get<T>(key: string): Promise<any>;

    abstract del(key: string, callback: (error: any) => void): void;
    abstract del(key: string): Promise<any>;
}
