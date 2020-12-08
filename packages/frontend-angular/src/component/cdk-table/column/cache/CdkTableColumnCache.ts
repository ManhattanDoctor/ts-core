import { IDestroyable } from '@ts-core/common';
import * as _ from 'lodash';
import { ICdkTableColumn } from '../ICdkTableColumn';

export abstract class CdkTableColumnCache<U, V> extends Map<string, V> implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _isEnabled: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected uidPropertyName: keyof U, isEnabled: boolean = true) {
        super();
        this.isEnabled = isEnabled;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitIsEnabledProperties(): void {
        this.clear();
    }

    protected getUid(item: U, column: ICdkTableColumn<U>): string {
        return `${column.name}-${item[this.uidPropertyName]}`;
    }

    protected abstract parseValue(item: U, column: ICdkTableColumn<U>): V;

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public getValue(item: U, column: ICdkTableColumn<U>): V {
        if (!this.isEnabled) {
            return this.parseValue(item, column);
        }
        let uid = this.getUid(item, column);
        if (this.has(uid)) {
            return this.get(uid);
        }
        let value = this.parseValue(item, column);
        this.set(uid, value);
        return value;
    }

    public destroy(): void {
        this.clear();
        this.uidPropertyName = null;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    public set isEnabled(value: boolean) {
        if (value === this._isEnabled) {
            return;
        }
        this._isEnabled = value;
        this.commitIsEnabledProperties();
    }
}
