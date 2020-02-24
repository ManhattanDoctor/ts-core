import * as _ from 'lodash';

export abstract class IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static instanceOf(data: any): boolean {
        return !_.isNil(data) ? _.isFunction(data['destroy']) : false;
    }

    public static destroy(value: any): boolean {
        if (!IDestroyable.instanceOf(value)) {
            return false;
        }
        value.destroy();
        return true;
    }

    // --------------------------------------------------------------------------
    //
    //  Abstract Methods
    //
    // --------------------------------------------------------------------------

    abstract destroy(): void;
}
