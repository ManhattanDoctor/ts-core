import { IsNumberString } from 'class-validator';
import * as _ from 'lodash';
import { Filterable } from './Filterable';
import { IPaginable } from './IPaginable';

export class Paginable<U> extends Filterable<U> implements IPaginable<U> {
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
        item.pageSize = !_.isNil(item.pageSize) ? parseInt(item.pageSize.toString(), 10) : 10;
        item.pageIndex = !_.isNil(item.pageIndex) ? parseInt(item.pageIndex.toString(), 10) : 0;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    // @Min(1)
    @IsNumberString()
    pageSize: number;

    // @Min(0)
    @IsNumberString()
    pageIndex: number;
}
