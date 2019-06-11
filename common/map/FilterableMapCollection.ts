import * as _ from 'lodash';
import { Destroyable } from '../../frontend';
import { DestroyableMapCollection } from './DestroyableMapCollection';
import { ArrayUtil } from '../util';

export class FilterableMapCollection<U extends Destroyable> extends DestroyableMapCollection<U> {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    protected _filters: Array<(U) => boolean>;
    protected _filtered: Array<U>;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(uidPropertyName: keyof U) {
        super(uidPropertyName);
        this._filters = [];
        this._filtered = [];
    }

    //--------------------------------------------------------------------------
    //
    //	Private Methods
    //
    //--------------------------------------------------------------------------

    protected filter(item: U): boolean {
        if (_.isEmpty(this._filters)) {
            return true;
        }
        return this._filters.every(filter => filter(item));
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public clear(): void {
        ArrayUtil.clear(this._filtered);
        super.clear();
    }

    public add(item: U, isFirst: boolean = false): U {
        item = super.add(item, isFirst);
        if (!_.isNil(item) && this.filter(item)) {
            if (isFirst) {
                this._filtered.unshift(item);
            } else {
                this._filtered.push(item);
            }
        }
        return item;
    }
    public remove(key: string): U {
        let item = super.remove(key);
        if (!_.isNil(item)) {
            ArrayUtil.remove(this._filtered, item);
        }
        return item;
    }

    public refresh(): void {
        ArrayUtil.clear(this._filtered);
        if (_.isEmpty(this.collection)) {
            return;
        }
        _.forEach(this._collection, item => {
            if (this.filter(item)) {
                this._filtered.push(item);
            }
        });
    }

    public destroy(): void {
        super.destroy();
        this._filtered = null;
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get filtered(): Array<U> {
        return this._filtered;
    }
    public get filters(): Array<(U) => void> {
        return this._filters;
    }
}
