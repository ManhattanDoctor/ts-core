import { IListItem } from '../IListItem';

export interface ISelectListItem<T = any> extends IListItem<T> {
    isSelected: boolean;
    selectedClassName?: string;
    checkSelected?: (item: ISelectListItem, ...params) => boolean;
}
