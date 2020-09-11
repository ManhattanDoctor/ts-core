import * as _ from 'lodash';
import { Filterable } from './Filterable';
import { IPaginable } from './IPaginable';

export class Paginable<U> extends Filterable<U> implements IPaginable<U> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_PAGE_SIZE = 10;
    public static DEFAULT_PAGE_INDEX = 0;

    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static transform<U>(item: IPaginable<U>): Paginable<U> {
        if (_.isNil(item)) {
            return item;
        }
        item = Filterable.transform(item) as IPaginable<U>;
        item.pageSize = !_.isNil(item.pageSize) ? parseInt(item.pageSize.toString(), 10) : Paginable.DEFAULT_PAGE_SIZE;
        item.pageIndex = !_.isNil(item.pageIndex) ? parseInt(item.pageIndex.toString(), 10) : Paginable.DEFAULT_PAGE_INDEX;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    pageSize: number;
    pageIndex: number;
}
