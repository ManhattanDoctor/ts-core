import { NavigationCancel, NavigationEnd, NavigationError, NavigationExtras, NavigationStart, Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { DestroyableContainer } from '@ts-core/common';
import { ObservableData } from '@ts-core/common/observer';
import { NativeWindowService } from '../../service/NativeWindowService';

export class RouterBaseService extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected map: Map<string, string>;
    protected observer: Subject<ObservableData<RouterBaseServiceEvent, void>>;

    protected paramsExtras: any;
    protected isNeedUpdateParams: boolean = false;

    protected _isLoading: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected router: Router, protected window: NativeWindowService) {
        super();
        this.map = new Map();
        this.observer = new Subject();

        this.window.getParams().forEach((value, key) => this.map.set(key, value));
        this.initializeObservers();
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected initializeObservers(): void {
        this.addSubscription(
            this.router.events.subscribe(event => {
                if (event instanceof NavigationStart) {
                    this.setLoading(true);
                } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                    this.setLoading(false);
                }
            })
        );
    }

    protected applyParams(extras?: NavigationExtras): void {
        let params = {} as NavigationExtras;
        params.queryParams = this.getQueryParams();
        if (extras) {
            Object.assign(params, extras);
        }
        if (this.isLoading) {
            this.isNeedUpdateParams = true;
            this.paramsExtras = extras;
        } else {
            this.router.navigate([], params);
        }
    }

    protected getQueryParams(): any {
        let params = {} as any;
        this.map.forEach((value, key) => (params[key] = value));
        return params;
    }

    private setLoading(value: boolean): void {
        if (value === this._isLoading) {
            return;
        }
        this._isLoading = value;
        this.observer.next(new ObservableData(RouterBaseServiceEvent.LOADING_CHANGED));

        if (!this.isLoading && this.isNeedUpdateParams) {
            this.isNeedUpdateParams = false;
            this.applyParams(this.paramsExtras);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public navigate(url: string, extras?: NavigationExtras): void {
        let params = {} as NavigationExtras;
        params.queryParams = this.getQueryParams();
        if (extras) Object.assign(params, extras);

        this.router.navigateByUrl(url, params);
    }

    public navigateToExternalUrl(url: string, target: string = '_blank'): void {
        this.window.open(url, target);
    }

    public navigateIfNotBusy(url: string, extras?: NavigationExtras): void {
        if (!this.isLoading) this.navigate(url, extras);
    }

    public isUrlActive(value: string): boolean {
        if (_.isNil(value) || _.isNil(this.url)) {
            return false;
        }
        return _.includes(this.url.toLowerCase(), value.toLowerCase());
    }

    public reload(): void {
        location.reload();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Param Methods
    //
    // --------------------------------------------------------------------------

    public getParams(): any {
        let params = {} as any;
        this.map.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    public hasParam(name: string): boolean {
        return this.map.has(name);
    }

    public getParam(name: string, defaultValue?: string): string {
        return this.hasParam(name) ? this.map.get(name) : defaultValue;
    }

    public setParam(name: string, value: any, extras?: NavigationExtras): void {
        if (value) {
            value = value.toString().trim();
            if (value.length === 0) {
                value = null;
            }
        }

        if (value) {
            this.map.set(name, value);
        } else {
            this.map.delete(name);
        }

        if (!extras) {
            extras = { replaceUrl: true };
        }

        this.applyParams(extras);
    }

    public removeParam(name: string, extras?: NavigationExtras): void {
        if (this.hasParam(name)) {
            this.setParam(name, null, extras);
        }
    }

    public get hasParams(): boolean {
        return this.map.size > 0;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Url Methods
    //
    // --------------------------------------------------------------------------

    public get url(): string {
        return this.router.url;
    }

    public get events(): Observable<ObservableData<RouterBaseServiceEvent, void>> {
        return this.observer.asObservable();
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }
}

export enum RouterBaseServiceEvent {
    LOADING_CHANGED = 'LOADING_CHANGED'
}
