import * as _ from 'lodash';
import { DestroyableContainer } from '@ts-core/common';
import { CdkTableRowStyleNameCache } from './cache/CdkTableRowStyleNameCache';
import { CdkTableRowClassNameCache } from './cache/CdkTableRowClassNameCache';

export class CdkRowColumnManager<U> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _classNameCache: CdkTableRowClassNameCache<U>;
    protected _styleNameCache: CdkTableRowStyleNameCache<U>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(uidPropertyName: keyof U) {
        super();
        this._classNameCache = new CdkTableRowClassNameCache(uidPropertyName);
        this._styleNameCache = new CdkTableRowStyleNameCache(uidPropertyName);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public getClass(item: U): string {
        return this.classNameCache.getValue(item);
    }

    public getStyle(item: U): { [key: string]: string } {
        return this.styleNameCache.getValue(item);
    }

    public clear(): void {
        this.classNameCache.clear();
        this.styleNameCache.clear();
    }

    public destroy(): void {
        super.destroy();

        if (!_.isNil(this._classNameCache)) {
            this._classNameCache.destroy();
            this._classNameCache = null;
        }
        if (!_.isNil(this._styleNameCache)) {
            this._styleNameCache.destroy();
            this._styleNameCache = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get styleNameCache(): CdkTableRowStyleNameCache<U> {
        return this._styleNameCache;
    }

    public get classNameCache(): CdkTableRowClassNameCache<U> {
        return this._classNameCache;
    }
}
