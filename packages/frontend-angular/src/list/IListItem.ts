import { IUIDable } from '@ts-core/common/dto';

export interface IListItem<T = any> extends IUIDable {
    label: string;
    sortIndex: number;
    isEnabled: boolean;
    translationId: string;

    data?: T;
    iconId?: string;
    className?: string;

    action?: (item: IListItem, ...params) => void;
    checkEnabled?: (item: IListItem, ...params) => boolean;
}
