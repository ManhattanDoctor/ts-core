import { IsString, IsOptional } from 'class-validator';
import * as _ from 'lodash';
import { IPaginableBookmark } from './IPaginableBookmark';
import { Filterable } from './Filterable';

export class PaginableBookmark<U> extends Filterable<U> implements IPaginableBookmark<U> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_PAGE_SIZE = 10;

    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static transform<U>(item: IPaginableBookmark<U>): PaginableBookmark<U> {
        if (_.isNil(item)) {
            return item;
        }
        item = Filterable.transform(item) as IPaginableBookmark<U>;
        item.pageSize = !_.isNil(item.pageSize) ? parseInt(item.pageSize.toString(), 10) : PaginableBookmark.DEFAULT_PAGE_SIZE;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    pageSize: number;

    @IsString()
    pageBookmark: string;

    @IsOptional()
    details?: Array<keyof U>;
}
