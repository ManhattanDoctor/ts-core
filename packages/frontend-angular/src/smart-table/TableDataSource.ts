import { IDestroyable, LoadableEvent } from '@ts-core/common';
import { ApiResponse } from '@ts-core/common/api';
import { LoadableMapCollection } from '@ts-core/common/map';
import { ObjectUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { LocalDataSource } from 'ng2-smart-table';
import { Subscription } from 'rxjs';

export class TableDataSource<U> extends LocalDataSource implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _count: number = 0;

    protected subscription: Subscription;
    protected promise: Promise<Array<U>> = null;
    protected promiseReject: (error: string) => void;
    protected promiseResolve: (items: Array<U>) => void;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected map: LoadableMapCollection<U, any>) {
        super();

        this.subscription = map.events.subscribe(data => {
            let response = data.data;
            switch (data.type) {
                case LoadableEvent.COMPLETE:
                    this.loadingCompleteHandler(response);
                    this.destroyPromise();
                    break;

                case LoadableEvent.ERROR:
                    this.loadingErrorHandler(response);
                    this.destroyPromise();
                    break;

                case LoadableEvent.STARTED:
                    if (this.promise) {
                        this.createPromise();
                    }

                    break;

                case LoadableEvent.FINISHED:
                    this.destroyPromise();
                    break;
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected loadingCompleteHandler(response: ApiResponse): void {
        this.data = this.map.collection;
        this._count = response.data.length;
        this.promiseResolve(this.data);
    }

    protected loadingErrorHandler(response: ApiResponse): void {
        this.promiseReject(response.error.toString());
    }

    protected createPromise(): void {
        this.promise = new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
        });
    }

    protected destroyPromise(): void {
        this.promise = null;
        this.promiseReject = null;
        this.promiseResolve = null;
    }

    protected reload(): void {
        this.map.reset();
        this.map.load();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        this.destroyPromise();

        this.subscription.unsubscribe();
        this.subscription = null;
        this.map = null;
    }

    public empty(): Promise<any> {
        this.map.clear();
        return super.empty();
    }

    public count(): number {
        return this._count;
    }

    public async getElements(): Promise<Array<U>> {
        if (this.promise) {
            return this.promise;
        }

        let map = this.map as any;
        if (ObjectUtil.hasOwnProperty(map, 'sort')) {
            let sorts = this.getSort();
            if (!_.isEmpty(sorts)) {
                ObjectUtil.clear(map.sort);
                for (let item of sorts) {
                    map.sort[item.field] = item.direction.toUpperCase() === 'ASC';
                }
            }
        }

        if (ObjectUtil.hasOwnProperty(map, 'conditions')) {
            let filters = this.getFilter();
            if (!_.isNil(filters) && !_.isEmpty(filters.filters)) {
                for (let item of filters.filters) {
                    map.conditions[item.field] = !_.isNil(item.filter) ? item.filter(item.search) : item.search;
                }
            }
        }

        this.createPromise();
        this.reload();
        return this.promise;
    }
}