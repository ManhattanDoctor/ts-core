import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { IDestroyable } from './IDestroyable';
import { ArrayUtil } from './util';

export class DestroyableContainer extends IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _destroyed: Subject<void>;

    private destroyables: Array<IDestroyable>;
    private subscriptions: Array<Subscription>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this._destroyed = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
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
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public addSubscription(value: Subscription): Subscription {
        if (_.isNil(this.subscriptions)) {
            this.subscriptions = [];
        }
        return this.addItem(value, this.subscriptions);
    }
    public removeSubscription(value: Subscription): void {
        ArrayUtil.remove(this.subscriptions, value);
    }

    public addDestroyable<T extends IDestroyable>(value: T): T {
        if (_.isNil(this.destroyables)) {
            this.destroyables = [];
        }
        return this.addItem(value as any, this.destroyables);
    }
    public removeDestroyable<T extends IDestroyable>(value: T): void {
        ArrayUtil.remove(this.destroyables, value);
    }

    // --------------------------------------------------------------------------
    //
    //  Interface Methods
    //
    // --------------------------------------------------------------------------

    public ngOnDestroy(): void {
        this.destroy();
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }

        if (!_.isEmpty(this.subscriptions)) {
            _.forEach(this.subscriptions, item => item.unsubscribe());
        }

        if (!_.isEmpty(this.destroyables)) {
            _.forEach(this.destroyables, item => item.destroy());
        }

        this._destroyed.next();
        this._destroyed.complete();
        this._destroyed = null;

        this.destroyables = null;
        this.subscriptions = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get destroyed(): Observable<void> {
        return !_.isNil(this._destroyed) ? this._destroyed.asObservable() : null;
    }

    public get isDestroyed(): boolean {
        return !_.isNil(this._destroyed) ? this._destroyed.closed : true;
    }
}
