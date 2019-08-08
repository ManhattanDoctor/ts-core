import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDestroyable } from './IDestroyable';
import { ArrayUtil } from './util';

export class DestroyableContainer extends IDestroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private _destroyables: Array<IDestroyable>;
    private _subscriptions: Array<Subscription>;

    protected isDestroyed: boolean = false;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private addItem<T>(value: T, collection: Array<T>): T {
        if (!collection.includes(value)) {
            collection.push(value);
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public addSubscription(value: Subscription): Subscription {
        if (_.isNil(this._subscriptions)) {
            this._subscriptions = [];
        }
        return this.addItem(value, this._subscriptions);
    }
    public removeSubscription(value: Subscription): void {
        ArrayUtil.remove(this._subscriptions, value);
    }

    public addDestroyable<T extends IDestroyable>(value: T): T {
        if (_.isNil(this._destroyables)) {
            this._destroyables = [];
        }
        return this.addItem(value as any, this._destroyables);
    }
    public removeDestroyable<T extends IDestroyable>(value: T): void {
        ArrayUtil.remove(this._destroyables, value);
    }

    // --------------------------------------------------------------------------
    //
    //	Interface Methods
    //
    // --------------------------------------------------------------------------

    public ngOnDestroy(): void {
        this.destroy();
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        this.isDestroyed = true;
        if (this._subscriptions) {
            _.forEach(this._subscriptions, item => item.unsubscribe());
            this._subscriptions = null;
        }
        if (this._destroyables) {
            _.forEach(this._destroyables, item => item.destroy());
            this._destroyables = null;
        }
    }
}
