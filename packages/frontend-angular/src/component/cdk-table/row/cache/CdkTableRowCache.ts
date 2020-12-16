import { IDestroyable } from '@ts-core/common';
import * as _ from 'lodash';

export abstract class CdkTableRowCache<U, V> extends Map<string, V> implements IDestroyable {
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

    protected getUid(item: U): string {
        return `${item[this.uidPropertyName]}`;
    }

    protected abstract parseValue(item: U): V;

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public getValue(item: U): V {
        if (!this.isEnabled) {
            return this.parseValue(item);
        }
        let uid = this.getUid(item);
        if (this.has(uid)) {
            return this.get(uid);
        }
        let value = this.parseValue(item);
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
