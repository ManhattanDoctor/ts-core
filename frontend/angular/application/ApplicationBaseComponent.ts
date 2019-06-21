import { AfterViewInit, ElementRef } from '@angular/core';
import { DestroyableContainer } from '../../../common';
import { PromiseHandler } from '../../../common/promise';

export abstract class ApplicationBaseComponent extends DestroyableContainer implements AfterViewInit {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private timeout: any;
    private isViewReady: boolean;

    private _viewReady: PromiseHandler;
    private isReadyAlreadyCalled: boolean;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(protected element: ElementRef, private viewReadyDelay: number = NaN) {
        super();
        this._viewReady = PromiseHandler.create<void>();
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    private makeViewReady = (): void => {
        this._viewReady.resolve();
        this.isViewReady = true;
        this.checkReady();
    };

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

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

    protected abstract readyHandler(): void;

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public ngAfterViewInit(): void {
        if (this.viewReadyDelay > 0) {
            this.timeout = setTimeout(this.makeViewReady, this.viewReadyDelay);
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

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get viewReady(): Promise<void> {
        return this._viewReady.promise;
    }
}
