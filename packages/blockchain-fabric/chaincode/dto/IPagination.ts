import { IPage } from './IPage';

export interface IPagination<U> extends IPage {
    isAllLoaded: boolean;
    items: Array<U>;
}
