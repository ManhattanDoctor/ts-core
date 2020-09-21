import * as _ from 'lodash';

export interface IUIDable {
    uid: string;
}

export type UID = IUIDable | string;

export function getUid(item: UID): string {
    if (_.isNil(item)) {
        return null;
    }
    return _.isString(item) ? item : item.uid;
}
