import { Injectable } from '@angular/core';
import { Loadable, LoadableStatus } from '../../common';

@Injectable()
export class LoadingService extends Loadable<void, void> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private counter: number = 0;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private checkStatus(): void {
        this.status = this.counter === 0 ? LoadableStatus.LOADED : LoadableStatus.LOADING;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public start(): void {
        this.counter++;
        this.checkStatus();
    }

    public finish(): void {
        this.counter--;
        this.checkStatus();
    }

    public destroy(): void {
        super.destroy();
        this.observer = null;
    }
}
