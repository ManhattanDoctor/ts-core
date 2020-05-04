import { IsNumberString, IsString, IsOptional } from 'class-validator';
import * as _ from 'lodash';
import { IPaginable } from './IPaginable';
import { Filterable } from '@ts-core/common/dto';

export class Paginable<U> extends Filterable<U> implements IPaginable<U> {
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

    public static transform<U>(item: IPaginable<U>): Paginable<U> {
        if (_.isNil(item)) {
            return item;
        }
        item = Filterable.transform(item) as IPaginable<U>;
        item.pageSize = !_.isNil(item.pageSize) ? parseInt(item.pageSize.toString(), 10) : Paginable.DEFAULT_PAGE_SIZE;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsNumberString()
    pageSize: number;

    @IsString()
    pageBookmark: string;

    @IsOptional()
    details?: Array<keyof U>;
}
