import { Observable, Subject, Subscription } from 'rxjs';
import { LoadableEvent } from '../Loadable';
import { ObservableData } from '../observer';
import { DestroyableMapCollection } from './DestroyableMapCollection';

export abstract class LoadableMapCollection<U, V> extends DestroyableMapCollection<U> {
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
    protected isNeedCleanAfterLoad: boolean = false;

    protected subscription: Subscription;
    protected observer: Subject<ObservableData<LoadableEvent | LoadableMapCollectionEvent, V>>;

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

    // --------------------------------------------------------------------------
    //
    //	Protected Abstract Methods
    //
    // --------------------------------------------------------------------------

    protected abstract parseItem(item: any): U;

    protected abstract makeRequest(): Observable<V>;

    protected abstract isErrorResponse(response: V): boolean;

    protected abstract parseResponse(response: V): void;

    protected abstract parseErrorResponse(response: V): void;

    protected isAbleToLoad(): boolean {
        return true;
    }

    protected setLength(value: number): void {
        if (value === this._length) {
            return;
        }
        this._length = value;
        this.observer.next(new ObservableData(LoadableMapCollectionEvent.MAP_LENGTH_CHANGED));
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public reload(): void {
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
            this.reloadTimer = null;
        }
        this._isDirty = true;
        this._isAllLoaded = false;
        this.isNeedCleanAfterLoad = true;
        this.load();
    }

    public reloadDefer(delay: number = 500): void {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(this.reloadHandler, delay);
    }

    public load(): void {
        if (this.isLoading || this.isAllLoaded || !this.isAbleToLoad()) {
            return;
        }

        this._isDirty = true;
        this._isLoading = true;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));

        let subscription = this.makeRequest().subscribe(response => {
            subscription.unsubscribe();
            this._isLoading = false;

            if (this.isNeedCleanAfterLoad) {
                this.isNeedCleanAfterLoad = false;
                this.clear();
            }
            if (!this.isErrorResponse(response)) {
                this.parseResponse(response);
                this.observer.next(new ObservableData(LoadableEvent.COMPLETE, response));
            } else {
                this.parseErrorResponse(response);
                this.observer.next(new ObservableData(LoadableEvent.ERROR, response));
            }
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
        });
    }

    public reset(): void {
        this._isDirty = false;
        this._isLoading = false;
        this._isAllLoaded = false;
        this.isNeedCleanAfterLoad = false;

        clearTimeout(this.reloadTimer);
        this.reloadTimer = null;

        this.clear();
    }

    public destroy(): void {
        super.destroy();
        this.reloadHandler = null;
        this.observer = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LoadableEvent | LoadableMapCollectionEvent, V>> {
        return this.observer.asObservable();
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public get isDirty(): boolean {
        return this._isDirty;
    }

    public get isAllLoaded(): boolean {
        return this._isAllLoaded;
    }
}

export enum LoadableMapCollectionEvent {
    MAP_LENGTH_CHANGED = 'MAP_LENGTH_CHANGED'
}
