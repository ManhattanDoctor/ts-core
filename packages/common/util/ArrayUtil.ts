import * as _ from 'lodash';

export class ArrayUtil {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createFixedLength<T>(length: number, initialValues?: Array<T>): Array<T> {
        let item = [];
        if (!_.isEmpty(initialValues)) {
            item = initialValues.slice(-length);
        }

        item.push = function() {
            if (this.length >= length) {
                this.shift();
            }
            return Array.prototype.push.apply(this, arguments as any);
        };
        return item;
    }

    public static sort(array: Array<{ sortIndex: number }>): void {
        if (!_.isEmpty(array)) {
            array.sort(ArrayUtil.sortFunction);
        }
    }

    private static sortFunction(first: { sortIndex: number }, second: { sortIndex: number }): number {
        if (!first && !second) {
            return 0;
        }
        if (first && !second) {
            return -1;
        }
        if (!first && second) {
            return 1;
        }
        if (first.sortIndex === second.sortIndex) {
            return 0;
        }
        return first.sortIndex < second.sortIndex ? -1 : 1;
    }

    public static move<T>(array: Array<T>, oldIndex: number, newIndex: number): void {
        if (_.isEmpty(array) || oldIndex === newIndex) {
            return;
        }
        if (oldIndex > -1 && newIndex < array.length && oldIndex != newIndex) {
            array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
        }
    }

    public static clear<T>(array: Array<T>): void {
        if (_.isEmpty(array)) {
            return;
        }
        array.splice(0, array.length);
    }

    public static remove<T>(array: Array<T>, item: T): boolean {
        if (_.isEmpty(array)) {
            return false;
        }
        let index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return index > -1;
    }

    public static chunk<T>(array: Array<T>, size: number): Array<Array<T>> {
        if (_.isEmpty(array)) {
            return [];
        }
        let items = [];
        while (array.length) {
            items.push(array.splice(0, size));
        }
        return items;
    }
}
