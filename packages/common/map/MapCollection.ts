import * as _ from 'lodash';
import { Destroyable } from '../Destroyable';
import { ExtendedError } from '../error';
import { ArrayUtil, ObjectUtil } from '../util';

export class MapCollection<U> extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected map: Map<string, U>;
    protected uidPropertyName: keyof U;

    protected _length: number;
    protected _maxLength: number;
    protected _collection: Array<U>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(uidPropertyName: keyof U, maxLength: number = NaN) {
        super();

        if (_.isNil(uidPropertyName)) {
            throw new ExtendedError(`uidPropertyName in undefined`);
        }

        this.map = new Map();
        this.uidPropertyName = uidPropertyName;

        this._length = 0;
        this._collection = [];
        this._maxLength = maxLength;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public add(item: U, isFirst: boolean = false): U {
        if (_.isNil(item) || !ObjectUtil.hasOwnProperty(item, this.uidPropertyName)) {
            return null;
        }

        let uid = this.getUidValue(item);
        if (!_.isString(uid)) {
            if (_.isNumber(uid)) {
                uid = parseFloat(uid).toString();
            } else {
                throw new ExtendedError(`Uid must be a string: "${uid}" is ${typeof uid}`);
            }
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
        this.checkMaxLength();
        return item;
    }

    public addItems(items: Array<U>): Array<U> {
        if (_.isNil(items) || _.isEmpty(items)) {
            return [];
        }
        return _.compact(items.map(item => this.add(item)));
    }

    public get(uid: string): U {
        return !_.isNil(uid) ? this.map.get(uid) : null;
    }

    public getFirst(): U {
        return !_.isEmpty(this._collection) ? this._collection[0] : null;
    }

    public getLast(): U {
        return !_.isEmpty(this._collection) ? this._collection[this._collection.length - 1] : null;
    }

    public has(uid: string): boolean {
        return !_.isNil(uid) ? this.map.has(uid) : null;
    }

    public clear() {
        this.map.clear();
        this._collection.splice(0, this._collection.length);
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

    public removeItems(uids: Array<string>): Array<U> {
        return _.compact(uids.map(item => this.remove(item)));
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

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getUidValue(item: U): string {
        return item[this.uidPropertyName as any];
    }

    protected setLength(value: number): void {
        this._length = value;
    }

    protected checkMaxLength(): void {
        if (_.isNaN(this._maxLength) || this._maxLength <= 0 || _.isNaN(this._length)) {
            return;
        }

        let delta = this._length - this._maxLength;
        if (_.isNaN(delta) || delta <= 0) {
            return;
        }

        for (let i = 0; i < delta; i++) {
            let item = this.getExcessItem();
            if (_.isNil(item)) {
                this.remove(this.getUidValue(item));
            }
        }
    }

    protected getExcessItem(): U {
        return this._collection[0];
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get length(): number {
        return this._length;
    }

    public get maxLength(): number {
        return this._maxLength;
    }

    public set maxLength(value: number) {
        if (value === this._maxLength) {
            return;
        }
        this._maxLength = value;
        this.checkMaxLength();
    }

    public get collection(): Array<U> {
        return this._collection;
    }
}
