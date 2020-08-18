import { IPageBookmark } from './IPageBookmark';

export interface IPaginationBookmark<U> extends IPageBookmark {
    isAllLoaded: boolean;
    items: Array<U>;
}
