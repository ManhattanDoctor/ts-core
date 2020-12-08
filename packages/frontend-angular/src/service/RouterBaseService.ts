import { NavigationCancel, NavigationEnd, NavigationError, NavigationExtras, NavigationStart, Router, UrlTree } from '@angular/router';
import { Loadable, LoadableEvent, LoadableStatus } from '@ts-core/common';
import { ObservableData } from '@ts-core/common/observer';
import { NativeWindowService } from '@ts-core/frontend/service/NativeWindowService';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class RouterBaseService extends Loadable<void, void> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected map: Map<string, string>;

    protected extrasToApply: any;
    protected isNeedUpdateExtras: boolean = false;

    protected _lastUrl: string;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected _router: Router, protected window: NativeWindowService) {
        super();
        this.map = new Map();
        this.observer = new Subject();

        this._lastUrl = this.url;
        this.window.getParams().forEach((value, key) => this.map.set(key, value));
        this.initializeObservers();
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected initializeObservers(): void {
        this.router.events.pipe(takeUntil(this.destroyed)).subscribe(event => {
            if (event instanceof NavigationStart) {
                this.status = LoadableStatus.LOADING;
            } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                this.status = LoadableStatus.LOADED;
                if (event instanceof NavigationEnd) {
                    this._lastUrl = event.url;
                }
            }
        });
    }

    protected async applyExtras(extras?: NavigationExtras): Promise<boolean> {
        let params = {} as NavigationExtras;
        params.queryParams = this.getQueryParams();

        if (!_.isNil(extras)) {
            Object.assign(params, extras);
        }

        if (!this.isLoading) {
            return this.router.navigate([], params);
        }
        this.extrasToApply = extras;
        this.isNeedUpdateExtras = true;
        return false;
    }

    protected getQueryParams(): any {
        let params = {} as any;
        this.map.forEach((value, key) => (params[key] = value));
        return params;
    }

    protected commitStatusChangedProperties(oldStatus: LoadableStatus, newStatus: LoadableStatus): void {
        super.commitStatusChangedProperties(oldStatus, newStatus);

        switch (newStatus) {
            case LoadableStatus.LOADING:
                this.observer.next(new ObservableData(LoadableEvent.STARTED));
                break;
            case LoadableStatus.LOADED:
                if (this.isNeedUpdateExtras) {
                    this.isNeedUpdateExtras = false;
                    this.applyExtras(this.extrasToApply);
                }
                this.observer.next(new ObservableData(LoadableEvent.COMPLETE));
                break;
        }

        if (newStatus === LoadableStatus.LOADED || newStatus === LoadableStatus.ERROR) {
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Navigate Methods
    //
    // --------------------------------------------------------------------------

    public async navigate(url: string, extras?: NavigationExtras): Promise<boolean> {
        let params = {} as NavigationExtras;
        params.queryParams = this.getQueryParams();
        if (!_.isNil(extras)) {
            Object.assign(params, extras);
        }
        return this.router.navigateByUrl(url, params);
    }

    public navigateToExternalUrl(url: string, target: string = '_blank'): void {
        this.window.open(url, target);
    }

    public navigateToLast(extras?: NavigationExtras): Promise<boolean> {
        return this.navigate(this.lastUrl, extras);
    }

    public async navigateIfNotLoading(url: string, extras?: NavigationExtras): Promise<boolean> {
        return !this.isLoading ? this.navigate(url, extras) : false;
    }

    public reload(): void {
        location.reload();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public isUrlActive(value: string | UrlTree, isExact: boolean = false): boolean {
        if (isExact) {
            return this.router.isActive(value, isExact);
        }
        if (_.isString(value)) {
            value = this.router.parseUrl(value);
        }

        let item = this.urlTree;
        value.queryParams = item.queryParams = {};
        return value.toString() === item.toString();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Param Methods
    //
    // --------------------------------------------------------------------------

    public getParams<T = any>(): T {
        let params = {} as any;
        this.map.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    public hasParam(name: string): boolean {
        return this.map.has(name);
    }

    public getParam<T = string>(name: string, defaultValue?: T): T {
        return this.hasParam(name) ? (this.map.get(name) as any) : defaultValue;
    }

    public setParam(name: string, value: any, extras?: NavigationExtras): void {
        if (!_.isNil(value)) {
            value = value.toString().trim();
            if (_.isEmpty(value)) {
                value = null;
            }
        }
        if (!_.isNil(value)) {
            this.map.set(name, value);
        } else {
            this.map.delete(name);
        }
        if (!_.isNil(extras)) {
            extras = { replaceUrl: true };
        }
        this.applyExtras(extras);
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

    public get lastUrl(): string {
        return this._lastUrl;
    }

    public get urlTree(): UrlTree {
        return this.router.parseUrl(this.url);
    }

    public get router(): Router {
        return this._router;
    }
}
