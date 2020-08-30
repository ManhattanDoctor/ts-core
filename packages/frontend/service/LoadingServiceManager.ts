import { Destroyable, LoadableEvent, DestroyableContainer } from '@ts-core/common';
import { ObservableData } from '@ts-core/common/observer';
import { Observable, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LoadingService } from '../service/LoadingService';
import * as _ from 'lodash';

export class LoadingServiceManager extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private items: Map<ILoadableItem, Subscription>;

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
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private loadableEventHandler = <V = any>(data: ObservableData<LoadableEvent, V>): void => {
        switch (data.type) {
            case LoadableEvent.STARTED:
                this.loading.start();
                break;
            case LoadableEvent.FINISHED:
                this.loading.finish();
                break;
        }
    };

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public addLoadable(...items: Array<ILoadableItem>): void {
        if (_.isEmpty(items)) {
            return;
        }

        items = items.filter(item => !this.items.has(item));
        for (let item of items) {
            this.items.set(
                item,
                item.events
                    .pipe(
                        filter(event => !_.isNil(LoadableEvent[event.type])),
                        takeUntil(this.destroyed)
                    )
                    .subscribe(event => this.loadableEventHandler(event))
            );
        }
    }

    public removeLoadable(...items: Array<ILoadableItem>): void {
        if (_.isEmpty(items)) {
            return;
        }

        items = items.filter(item => !this.items.has(item));
        for (let item of items) {
            this.items.get(item).unsubscribe();
            this.items.delete(item);
        }
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

export interface ILoadableItem<U = any, V = any> {
    events: Observable<ObservableData<U, V>>;
}
