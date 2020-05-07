import { IDestroyable, LoadableEvent } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { DataSourceMapCollection, DataSourceMapCollectionEvent } from '@ts-core/common/map/dataSource';
import { PromiseHandler } from '@ts-core/common/promise';
import { ObjectUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { LocalDataSource } from 'ng2-smart-table';
import { Subscription } from 'rxjs';

export class SmartTableDataSource<U> extends LocalDataSource implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _count: number = 0;

    protected promise: PromiseHandler<Array<U>, ExtendedError> = null;
    protected subscription: Subscription;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected map: DataSourceMapCollection<U>) {
        super();

        this.subscription = map.events.subscribe(data => {
            switch (data.type) {
                case LoadableEvent.STARTED:
                    this.promiseCreateIfNeed();
                    break;

                case LoadableEvent.COMPLETE:
                    this.parseResponse(data.data);
                    break;

                case DataSourceMapCollectionEvent.DATA_LOADED_AND_PARSED:
                    this.parseParsedResponse(data.data);
                    break;

                case LoadableEvent.ERROR:
                    this.parseError(data.error);
                    break;

                case LoadableEvent.FINISHED:
                    this.promiseDestroy();
                    break;
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected parseResponse(response: any): void {
        if (_.isArray(response)) {
            this._count = response.length;
        } else if (ObjectUtil.hasOwnProperty(response, 'total')) {
            this._count = response.total;
        } else {
            throw new ExtendedError(`Unable to update "count": response is invalid`);
        }
    }

    protected parseParsedResponse(response: Array<U>): void {
        this.data = response;
        if (this.promise) {
            this.promise.resolve(this.data);
        }
    }

    protected parseError(error: ExtendedError): void {
        if (this.promise) {
            this.promise.reject(error);
        }
    }

    protected commitMapProperties(): void {
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
    }

    // --------------------------------------------------------------------------
    //
    // 	Help Methods
    //
    // --------------------------------------------------------------------------

    protected promiseCreateIfNeed(): void {
        if (!this.promise) {
            this.promise = PromiseHandler.create();
        }
    }

    protected promiseDestroy(): void {
        if (this.promise) {
            this.promise.destroy();
            this.promise = null;
        }
    }

    protected reload(): void {
        this.commitMapProperties();
        this.map.reset();
        this.map.load();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        this.promiseDestroy();

        this.subscription.unsubscribe();
        this.subscription = null;
        this.map = null;
    }

    public empty(): Promise<any> {
        this.map.clear();
        return super.empty();
    }

    public setPaging(page: number, perPage: number, doEmit?: boolean): LocalDataSource {
        let map = this.map as any;
        if (ObjectUtil.instanceOf(map, ['pageIndex', 'pageSize'])) {
            map.pageIndex = Math.max(0, page - 1);
            map.pageSize = Math.max(1, perPage);
        }
        return super.setPaging(page, perPage, doEmit);
    }

    public setPage(page: number, doEmit?: boolean): LocalDataSource {
        let map = this.map as any;
        if (ObjectUtil.instanceOf(map, ['pageIndex'])) {
            map.pageIndex = Math.max(0, page - 1);
        }
        return super.setPage(page, doEmit);
    }

    public async getElements(): Promise<any> {
        if (this.promise) {
            return this.promise.promise;
        }

        this.promiseCreateIfNeed();
        this.reload();
        return this.promise.promise;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public count(): number {
        return this._count;
    }
}
