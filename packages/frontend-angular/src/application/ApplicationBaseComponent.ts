import { AfterViewInit, ElementRef } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import { PromiseHandler } from '@ts-core/common/promise';

export abstract class ApplicationBaseComponent extends DestroyableContainer implements AfterViewInit {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private timeout: any;

    private _viewReadyPromise: PromiseHandler<void, void>;
    private isReadyAlreadyCalled: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected element: ElementRef, private viewReadyDelay: number = NaN) {
        super();
        this._viewReadyPromise = PromiseHandler.create();
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private makeViewReady = (): void => {
        this._viewReadyPromise.resolve();
        this.viewReadyHandler();
        this.checkReady();
    };

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkReady(): void {
        if (!this.isReady() || this.isReadyAlreadyCalled) {
            return;
        }

        this.isReadyAlreadyCalled = true;
        this.readyHandler();
    }

    protected isReady(): boolean {
        return this.isViewReady;
    }

    protected viewReadyHandler(): void {}

    protected abstract readyHandler(): void;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public ngAfterViewInit(): void {
        if (this.viewReadyDelay > 0) {
            PromiseHandler.delay(this.viewReadyDelay).then(this.makeViewReady);
        } else {
            this.makeViewReady();
        }
    }

    public destroy(): void {
        super.destroy();
        this.element = null;

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isViewReady(): boolean {
        return this._viewReadyPromise.isResolved;
    }
    public get viewReady(): Promise<void> {
        return this._viewReadyPromise.promise;
    }
}
