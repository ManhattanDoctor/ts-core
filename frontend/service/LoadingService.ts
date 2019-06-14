import { Loadable, LoadableStatus } from '../../common';
import { ObservableData } from '../../common/observer';

export class LoadingService extends Loadable<LoadingServiceEvent, number> {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private _counter: number = 0;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor() {
        super();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public start(): void {
        this.counter++;
    }

    public finish(): void {
        this.counter--;
    }

    public destroy(): void {
        super.destroy();
        this.observer = null;
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    //--------------------------------------------------------------------------

    private get counter(): number {
        return this._counter;
    }

    private set counter(value: number) {
        if (value === this._counter) {
            return;
        }

        this._counter = value;
        this.status = value === 0 ? LoadableStatus.LOADING : LoadableStatus.LOADED;
        this.observer.next(new ObservableData(LoadingServiceEvent.CHANGED, value));
    }
}

export enum LoadingServiceEvent {
    CHANGED = 'CHANGED'
}
