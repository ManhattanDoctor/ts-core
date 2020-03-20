import { PromiseHandler } from '@ts-core/common/promise';
import * as fs from 'fs';

export class FileUtil {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public static async isExists(path: string): Promise<boolean> {
        let promise = PromiseHandler.create();
        fs.exists(path, value => {
            promise.resolve(value);
        });
        return promise.promise;
    }

    public static async remove(path: string): Promise<void> {
        let promise = PromiseHandler.create();
        fs.unlink(path, error => {
            console.log(path, error);
            if (error) {
                promise.reject(error.message);
            } else {
                promise.resolve();
            }
        });
        return promise.promise;
    }

    public static async directoryCreate(path: string): Promise<void> {
        let promise = PromiseHandler.create();
        fs.mkdir(path, error => {
            if (error) {
                promise.reject(error.message);
            } else {
                promise.resolve();
            }
        });
        return promise.promise;
    }

    public static async jsonRead<D>(path: string): Promise<D> {
        let promise = PromiseHandler.create();
        fs.readFile(path, 'utf8', (error, data) => {
            if (error) {
                promise.reject(error.message);
            } else {
                promise.resolve(JSON.parse(data));
            }
        });
        return promise.promise;
    }

    public static async jsonSave<D>(path: string, data: D): Promise<D> {
        let promise = PromiseHandler.create();
        fs.writeFile(path, JSON.stringify(data, null, 4), 'utf8', error => {
            if (error) {
                promise.reject(error.message);
            } else {
                promise.resolve(data);
            }
        });
        return promise.promise;
    }
}
