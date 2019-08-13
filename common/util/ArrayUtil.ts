import * as _ from 'lodash';

export class ArrayUtil {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

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

        if (first.sortIndex == second.sortIndex) {
            return 0;
        }

        return first.sortIndex < second.sortIndex ? -1 : 1;
    }

    public static move(array: Array<any>, oldIndex: number, newIndex: number): void {
        if (_.isEmpty(array) || oldIndex === newIndex) {
            return;
        }
        if (oldIndex > -1 && newIndex < array.length && oldIndex != newIndex) {
            array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
        }
    }

    public static clear(array: Array<any>): void {
        if (_.isEmpty(array)) {
            return;
        }
        array.splice(0, array.length);
    }

    public static remove(array: Array<any>, item: any): boolean {
        if (_.isEmpty(array)) {
            return false;
        }
        let index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return index > -1;
    }
}
