import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { Destroyable } from './Destroyable';
import { IDestroyable } from './IDestroyable';
import { ArrayUtil } from './util';

export class DestroyableContainer extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private destroyables: Array<IDestroyable>;
    private subscriptions: Array<Subscription>;

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
        super.destroy();
        if (this.isDestroyed) {
            return;
        }

        if (!_.isEmpty(this.subscriptions)) {
            _.forEach(this.subscriptions, item => item.unsubscribe());
        }

        if (!_.isEmpty(this.destroyables)) {
            _.forEach(this.destroyables, item => item.destroy());
        }

        this.destroyables = null;
        this.subscriptions = null;
    }
}
