import * as _ from 'lodash';

export class RandomUtil {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    private static RANDOM_STRING_VALUES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static randomColor(): number {
        return Math.random() * 0xffffff;
    }

    public static randomBoolean(): boolean {
        return Math.random() >= 0.5;
    }

    public static randomUrl(url: string): string {
        if (_.isEmpty(url)) {
            return url;
        }
        let value = url.includes('?') ? '&' : '?';
        value += 'rnd=' + RandomUtil.randomString(10) + RandomUtil.randomNumber(0, 1000000);
        return url + value;
    }

    public static randomString(length: number = 10, availableChars?: string): string {
        if (_.isNil(availableChars)) {
            availableChars = RandomUtil.RANDOM_STRING_VALUES;
        }

        let value = '';
        for (let i = 0; i < length; i++) {
            value += availableChars.charAt(RandomUtil.randomNumber(0, availableChars.length - 1));
        }
        return value;
    }

    public static randomDate(start: Date, finish: Date): Date {
        return new Date(start.getTime() + Math.random() * (finish.getTime() - start.getTime()));
    }

    public static randomNumber(min: number = NaN, max: number = NaN): number {
        if (_.isNaN(min)) {
            min = 0;
        }
        if (_.isNaN(max)) {
            max = Number.MAX_VALUE - 1;
        }
        return Math.round(Math.random() * (max - min)) + min;
    }

    public static randomArrayIndex(array: Array<any>): number {
        return RandomUtil.randomNumber(0, array.length - 1);
    }

    public static randomArrayItem<T>(array: Array<T>): T {
        return array[RandomUtil.randomArrayIndex(array)];
    }

    public static randomKey(object: any): any {
        let keys = Object.keys(object);
        let randomKeyIndex = RandomUtil.randomNumber(0, keys.length - 1);
        return keys[randomKeyIndex];
    }
}
