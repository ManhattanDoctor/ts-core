import * as _ from 'lodash';
import { CdkTableRowCache } from './CdkTableRowCache';

export class CdkTableRowClassNameCache<U> extends CdkTableRowCache<U, string> {
    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseValue(item: U): string {
        return null;
    }
}
