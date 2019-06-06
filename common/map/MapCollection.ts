import * as _ from 'lodash';
import { Destroyable } from '../../frontend';
import { ArrayUtil } from '../../frontend/util';
import { ExtendedError } from '../error/ExtendedError';
import { ObjectUtil } from '../util/ObjectUtil';

export class MapCollection<U> extends Destroyable {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    protected map: Map<string, U>;
    protected uidPropertyName: keyof U;

    protected _length: number;
    protected _collection: Array<U>;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(uidPropertyName: keyof U) {
        super();
        this.map = new Map();
        this.uidPropertyName = uidPropertyName;

        this._length = 0;
        this._collection = [];
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public add(item: U, isFirst: boolean = false): U {
        if (_.isNil(item) || !ObjectUtil.hasOwnProperty(item, this.uidPropertyName)) {
            return null;
        }

        let uid = this.getUidValue(item);
        if (!_.isString(uid)) {
            throw new ExtendedError(`Uid must be a string: "${uid}" is ${typeof uid}`);
        }

        if (this.has(uid)) {
            return null;
        }

        if (isFirst) {
            this._collection.unshift(item);
        } else {
            this._collection.push(item);
        }

        this.map.set(uid, item);
        this.setLength(this._collection.length);
        return item;
    }

    public get(uid: string): U {
        return !_.isNil(uid) ? this.map.get(uid) : null;
    }

    public has(uid: string): boolean {
        return !_.isNil(uid) ? this.map.has(uid) : null;
    }

    public clear() {
        this.map.clear();
        this._collection.splice(0, this.length);
        this.setLength(this._collection.length);
    }

    public destroy(): void {
        this.clear();
        this.map = null;
        this._collection = null;
    }

    public remove(uid: string): U {
        if (!this.has(uid)) {
            return null;
        }
        let item = this.get(uid);
        if (ArrayUtil.remove(this._collection, item)) {
            this.setLength(this._collection.length);
        }
        this.map.delete(uid);
        return item;
    }

    public move(oldIndex: number, newIndex: number): void {
        ArrayUtil.move(this._collection, oldIndex, newIndex);
    }

    public keys(): Array<string> {
        return Array.from(this.map.keys());
    }

    public values(): Array<U> {
        return Array.from(this.map.values());
    }

    public clone(): MapCollection<U> {
        let value = new MapCollection<U>(this.uidPropertyName);
        _.forEach(this._collection, item => value.add(item));
        return value;
    }

    public trackByFn = (index: number, item: U): any => {
        let uid = null;
        try {
            uid = this.getUidValue(item);
        } catch (error) {}

        return !_.isNil(uid) ? uid : index;
    };

    //--------------------------------------------------------------------------
    //
    //	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected getUidValue(item: U): string {
        return item[this.uidPropertyName as any];
    }

    protected setLength(value: number): void {
        this._length = value;
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get length(): number {
        return this._length;
    }

    public get collection(): Array<U> {
        return this._collection;
    }
}
