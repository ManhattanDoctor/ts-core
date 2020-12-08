import * as _ from 'lodash';
import { CdkTableColumnCache } from './CdkTableColumnCache';
import { ICdkTableColumn } from '../ICdkTableColumn';

export class CdkTableColumnValueCache<U> extends CdkTableColumnCache<U, string | number | U[keyof U]> {
    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseValue(item: U, column: ICdkTableColumn<U>): string | number | U[keyof U] {
        return !_.isNil(column.format) ? column.format(item, column) : item[column.name];
    }
}
