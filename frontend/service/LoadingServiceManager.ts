import { Observable, Subscription } from 'rxjs';
import { Destroyable, LoadableEvent } from '@ts-core/common';
import { ObservableData } from '@ts-core/common/observer';
import { LoadingService } from '../service/LoadingService';

export class LoadingServiceManager extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private items: Map<LoadableItem, Subscription>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected loading: LoadingService) {
        super();
        this.items = new Map();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public addLoadable(item: LoadableItem): void {
        if (this.items.has(item)) {
            return;
        }

        this.items.set(
            item,
            item.events.subscribe(data => {
                switch (data.type) {
                    case LoadableEvent.STARTED:
                        this.loading.start();
                        break;
                    case LoadableEvent.FINISHED:
                        this.loading.finish();
                        break;
                }
            })
        );
    }

    public removeLoadable(item: LoadableItem): void {
        if (!this.items.has(item)) {
            return;
        }
        this.items.get(item).unsubscribe();
        this.items.delete(item);
    }

    public destroy(): void {
        if (this.items) {
            this.items.forEach(value => value.unsubscribe());
            this.items.clear();
            this.items = null;
        }
        this.loading = null;
    }
}

export interface LoadableItem<U = any, V = any> {
    events: Observable<ObservableData<U, V>>;
}
