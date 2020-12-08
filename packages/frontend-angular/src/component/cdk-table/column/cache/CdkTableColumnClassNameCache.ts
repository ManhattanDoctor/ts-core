import * as _ from 'lodash';
import { CdkTableColumnCache } from './CdkTableColumnCache';
import { ICdkTableColumn } from '../ICdkTableColumn';

export class CdkTableColumnClassNameCache<U> extends CdkTableColumnCache<U, string> {
    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseValue(item: U, column: ICdkTableColumn<U>): string {
        return !_.isNil(column.className) ? (_.isString(column.className) ? column.className : column.className(item, column)) : null;
    }
}
