import { IPageBookmark } from './IPageBookmark';
import { IFilterable } from './IFilterable';

export interface IPaginableBookmark<U> extends IFilterable<U>, IPageBookmark {
    details?: Array<keyof U>;
}
