import * as _ from 'lodash';
import { CdkTableCache } from './CdkTableCache';

export class CdkTableRowClassNameCache<U> extends CdkTableCache<U, string> {
    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseValue(item: U): string {
        return !_.isNil(column.className) ? (_.isString(column.className) ? column.className : column.className(item, column)) : null;
    }
}
