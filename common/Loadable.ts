import { Observable, Subject } from 'rxjs';
import { DestroyableContainer } from './DestroyableContainer';
import { ObservableData } from './observer';

export abstract class Loadable<U, V> extends DestroyableContainer {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    protected status: LoadableStatus;
    protected observer: Subject<ObservableData<U | LoadableEvent, V>>;

    protected isDestroyed: boolean;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    protected constructor() {
        super();
        this.status = LoadableStatus.NOT_LOADED;
        this.observer = new Subject();
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public destroy(): void {
        this.observer = null;
        this.isDestroyed = true;
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

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
}

export enum LoadableEvent {
    ERROR = 'ERROR',
    STARTED = 'STARTED',
    COMPLETE = 'COMPLETE',
    FINISHED = 'FINISHED'
}

export enum LoadableStatus {
    ERROR = 'ERROR',
    LOADED = 'LOADED',
    LOADING = 'LOADING',
    NOT_LOADED = 'NOT_LOADED'
}
