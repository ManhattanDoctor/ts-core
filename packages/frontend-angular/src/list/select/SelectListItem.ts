import { ISelectListItem } from './ISelectListItem';
import * as _ from 'lodash';
import { ListItem } from '../ListItem';
import { IListItem } from '../IListItem';

export class SelectListItem<T = any> extends ListItem<T> implements ISelectListItem<T> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _isSelected: boolean;
    protected _selectedClassName: string;

    public checkSelected?: (item: ISelectListItem, ...params) => boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(translationId: string, sortIndex: number, data: T, checkEnabled?: (item: IListItem, ...params) => boolean) {
        super(translationId, sortIndex, data);
        this.checkEnabled = checkEnabled;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitIsSelectProperties(): void {}

    protected commitSelectedClassNameProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this.checkSelected = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isSelected(): boolean {
        return this._isSelected;
    }
    public set isSelected(value: boolean) {
        if (value === this._isSelected) {
            return;
        }
        this._isSelected = value;
        if (!_.isNil(value)) {
            this.commitIsSelectProperties();
        }
    }

    public get selectedClassName(): string {
        return this._selectedClassName;
    }
    public set selectedClassName(value: string) {
        if (value === this._selectedClassName) {
            return;
        }
        this._selectedClassName = value;
        if (!_.isNil(value)) {
            this.commitSelectedClassNameProperties();
        }
    }
}
