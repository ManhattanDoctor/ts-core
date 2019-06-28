import * as _ from 'lodash';

export abstract class IDestroyable {
    abstract destroy(): void;
}

export function isIDestroyable(value: any): boolean {
    return !_.isNil(value) ? _.isFunction(value['destroy']) : false;
}

export function destroyIfCan(value: any): boolean {
    if (!isIDestroyable(value)) {
        return false;
    }
    value.destroy();
    return true;
}
