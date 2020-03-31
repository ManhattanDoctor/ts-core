import { Observable, Subject } from 'rxjs';
import { DestroyableContainer } from './DestroyableContainer';
import { ObservableData } from './observer';

export abstract class Loadable<U = any, V = any> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _status: LoadableStatus;
    protected observer: Subject<ObservableData<U | LoadableEvent, V>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor() {
        super();
        this._status = LoadableStatus.NOT_LOADED;
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitStatusChangedProperties(oldStatus: LoadableStatus, newStatus: LoadableStatus): void {
        this.observer.next(new ObservableData(LoadableEvent.STATUS_CHANGED));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    protected get status(): LoadableStatus {
        return this._status;
    }
    protected set status(value: LoadableStatus) {
        if (value === this._status) {
            return;
        }
        let oldValue = this._status;
        this._status = value;
        this.commitStatusChangedProperties(oldValue, value);
    }
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<U | LoadableEvent, V>> {
        return this.observer.asObservable();
    }

    public get isLoaded(): boolean {
        return this.status === LoadableStatus.LOADED;
    }
    public get isError(): boolean {
        return this.status === LoadableStatus.ERROR;
    }
    public get isLoading(): boolean {
        return this.status === LoadableStatus.LOADING;
    }
    public get isNotLoaded(): boolean {
        return this.status === LoadableStatus.NOT_LOADED;
    }
}

export interface ILoadable {}

export enum LoadableEvent {
    ERROR = 'ERROR',
    STARTED = 'STARTED',
    COMPLETE = 'COMPLETE',
    FINISHED = 'FINISHED',

    STATUS_CHANGED = 'STATUS_CHANGED'
}

export enum LoadableStatus {
    ERROR = 'ERROR',
    LOADED = 'LOADED',
    LOADING = 'LOADING',
    NOT_LOADED = 'NOT_LOADED'
}
