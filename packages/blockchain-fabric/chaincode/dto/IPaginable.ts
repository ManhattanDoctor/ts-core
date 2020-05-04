import { IPage } from './IPage';
import { IFilterable } from '@ts-core/common/dto';

export interface IPaginable<U> extends IFilterable<U>, IPage {
    details?: Array<keyof U>;
}
