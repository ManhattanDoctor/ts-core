import * as _ from 'lodash';
import { CdkTableColumnCache } from './CdkTableColumnCache';
import { ICdkTableColumn } from '../ICdkTableColumn';

export class CdkTableColumnStyleNameCache<U> extends CdkTableColumnCache<U, { [key: string]: string }> {
    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseValue(item: U, column: ICdkTableColumn<U>): { [key: string]: string } {
        return !_.isNil(column.styleName) ? column.styleName(item, column) : null;
    }
}
