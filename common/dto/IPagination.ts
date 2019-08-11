import { IPage } from './IPage';

export interface IPagination<U> extends IPage {
    pages: number;
    total: number;
    items: Array<U>;
}
