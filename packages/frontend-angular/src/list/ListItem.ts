import { IListItem } from './IListItem';
import * as _ from 'lodash';
import { IDestroyable } from '@ts-core/common';

export class ListItem<T = any> implements IListItem<T>, IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _uid: string;

    protected _data: T;
    protected _label: string;
    protected _iconId: string;
    protected _className: string;
    protected _sortIndex: number;
    protected _isEnabled: boolean = true;
    protected _translationId: string;

    public action: (item: IListItem, ...params) => void;
    public checkEnabled: (item: IListItem, ...params) => boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(translationId: string, sortIndex: number = NaN, data?: T, iconId?: string) {
        this.data = data;
        this.iconId = iconId;
        this.sortIndex = sortIndex;
        this.translationId = translationId;

        this._uid = this.getUid();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitDataProperties(): void {}
    protected commitLabelProperties(): void {}
    protected commitIsEnabledProperties(): void {}
    protected commitClassNameProperties(): void {}

    protected commitIconIdProperties(): void {}
    protected commitSortIndexProperties(): void {}
    protected commitTranslationIdProperties(): void {}

    protected getUid(): string {
        return `${this.translationId}_${this.sortIndex}`;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        this._data = null;
        this.action = null;
        this.checkEnabled = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get uid(): string {
        return this._uid;
    }

    public get sortIndex(): number {
        return this._sortIndex;
    }
    public set sortIndex(value: number) {
        if (value === this._sortIndex) {
            return;
        }
        this._sortIndex = value;
        if (!_.isNil(value)) {
            this.commitSortIndexProperties();
        }
    }

    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    public set isEnabled(value: boolean) {
        if (value === this._isEnabled) {
            return;
        }
        this._isEnabled = value;
        if (_.isBoolean(value)) {
            this.commitIsEnabledProperties();
        }
    }

    public get label(): string {
        return this._label;
    }
    public set label(value: string) {
        if (value === this._label) {
            return;
        }
        this._label = value;
        if (!_.isNil(value)) {
            this.commitLabelProperties();
        }
    }

    public get translationId(): string {
        return this._translationId;
    }
    public set translationId(value: string) {
        if (value === this._translationId) {
            return;
        }
        this._translationId = value;
        if (!_.isNil(value)) {
            this.commitTranslationIdProperties();
        }
    }

    public get iconId(): string {
        return this._iconId;
    }
    public set iconId(value: string) {
        if (value === this._iconId) {
            return;
        }
        this._iconId = value;
        if (!_.isNil(value)) {
            this.commitIconIdProperties();
        }
    }

    public get className(): string {
        return this._className;
    }
    public set className(value: string) {
        if (value === this._className) {
            return;
        }
        this._className = value;
        if (!_.isNil(value)) {
            this.commitClassNameProperties();
        }
    }

    public get data(): T {
        return this._data;
    }
    public set data(value: T) {
        if (value === this._data) {
            return;
        }
        this._data = value;
        if (!_.isNil(value)) {
            this.commitDataProperties();
        }
    }
}
