import * as _ from 'lodash';
import { CdkTableRowCache } from './CdkTableRowCache';

export class CdkTableRowStyleNameCache<U> extends CdkTableRowCache<U, { [key: string]: string }> {
    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseValue(item: U): { [key: string]: string } {
        return null;
    }
}
