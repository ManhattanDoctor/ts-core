import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { ExtendedError } from '../../error/ExtendedError';
import { LoadableEvent } from '../../Loadable';
import { ObservableData } from '../../observer/ObservableData';
import { DestroyableMapCollection } from '../DestroyableMapCollection';

export abstract class DataSourceMapCollection<U, V = any> extends DestroyableMapCollection<U> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _isDirty: boolean = false;
    protected _isLoading: boolean = false;
    protected _isAllLoaded: boolean = false;

    protected reloadTimer: any;
    protected reloadHandler: () => void;
    protected isReloadRequest: boolean = false;

    protected subscription: Subscription;
    protected observer: Subject<ObservableData<LoadableEvent | DataSourceMapCollectionEvent, V | Array<U>>>;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(uidPropertyName: keyof U) {
        super(uidPropertyName);
        this.initialize();
    }

    // --------------------------------------------------------------------------
    //
    //	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        this.observer = new Subject();
        this.reloadHandler = this.reload.bind(this);
    }

    protected parseResponse(response: V): void {
        let items = this.getResponseItems(response);
        this.parseItems(items);
        this.checkIsAllLoaded(response, items);
    }

    protected parseItems(items: Array<any>): void {
        let parsed = _.compact(items.map(item => this.parseItem(item)));
        this.addItems(parsed);
        this.observer.next(new ObservableData(DataSourceMapCollectionEvent.DATA_LOADED_AND_PARSED, parsed));
    }

    protected parseError(error: ExtendedError): void {}

    protected getResponseItems(response: V): Array<any> {
        return _.isArray(response) ? response : [];
    }

    protected checkIsAllLoaded(response: V, items: Array<any>): void {
        this._isAllLoaded = true;
    }

    protected isAbleToLoad(): boolean {
        return !this.isLoading && !this.isAllLoaded;
    }

    protected isNeedClearAfterLoad(response: V): boolean {
        return this.isReloadRequest;
    }

    protected setLength(value: number): void {
        if (value === this._length) {
            return;
        }
        this._length = value;
        this.observer.next(new ObservableData(DataSourceMapCollectionEvent.MAP_LENGTH_CHANGED));
    }

    // --------------------------------------------------------------------------
    //
    //	Protected Abstract Methods
    //
    // --------------------------------------------------------------------------

    protected abstract request(): Promise<V>;

    protected abstract parseItem(item: any): U;

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public async reload(): Promise<void> {
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
            this.reloadTimer = null;
        }
        this._isDirty = true;
        this._isAllLoaded = false;
        this.isReloadRequest = true;
        return this.load();
    }

    public reloadDefer(delay: number = 500): void {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(this.reloadHandler, delay);
    }

    public async load(): Promise<void> {
        if (!this.isAbleToLoad()) {
            return;
        }

        this._isDirty = true;
        this._isLoading = true;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));

        try {
            let response = await this.request();
            if (this.isNeedClearAfterLoad(response)) {
                this.clear();
            }
            this.parseResponse(response);
            this.isReloadRequest = false;
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, response));
        } catch (error) {
            error = ExtendedError.create(error);
            this.parseError(error);
            this.observer.next(new ObservableData(LoadableEvent.ERROR, null, error));
        }

        this._isLoading = false;
        this.observer.next(new ObservableData(LoadableEvent.FINISHED));
    }

    public reset(): void {
        this._isDirty = false;
        this._isLoading = false;
        this._isAllLoaded = false;
        this.isReloadRequest = false;

        clearTimeout(this.reloadTimer);
        this.reloadTimer = null;

        this.clear();
    }

    public destroy(): void {
        super.destroy();
        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }

        this._length = null;
        this.reloadHandler = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LoadableEvent | DataSourceMapCollectionEvent, V | Array<U>>> {
        return this.observer.asObservable();
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public get isDirty(): boolean {
        return this._isDirty;
    }

    public get isClear(): boolean {
        return !this.isDirty;
    }

    public get isAllLoaded(): boolean {
        return this._isAllLoaded;
    }
}

export enum DataSourceMapCollectionEvent {
    MAP_LENGTH_CHANGED = 'MAP_LENGTH_CHANGED',
    DATA_LOADED_AND_PARSED = 'DATA_LOADED_AND_PARSED'
}
