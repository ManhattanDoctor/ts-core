import { Destroyable } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { MapCollection } from '@ts-core/common/map';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { CookieStorageUtil, ICookieStorageOptions } from '../cookie';
import { Theme } from './Theme';

export class ThemeService extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private _theme: Theme;
    private _themes: MapCollection<Theme>;

    private isInitialized: boolean;
    private observer: Subject<string>;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private options?: IThemeServiceOptions) {
        super();
        this.observer = new Subject();
        this._themes = new MapCollection('name');
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public initialize(themes: Array<any>): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }
        this.isInitialized = true;

        this.themes.clear();
        if (!_.isEmpty(themes)) {
            for (let item of themes) {
                let theme = new Theme();
                theme.update(item);
                this.themes.add(theme);
            }
        }
    }

    public loadIfExist(defaultTheme?: string): void {
        if (!this.isInitialized) {
            throw new ExtendedError('Service in not initialized');
        }

        let name = CookieStorageUtil.get(this.options) || defaultTheme;
        if (this.themes.has(name)) {
            this.theme = this.themes.get(name);
        } else if (this.themes.length > 0) {
            this.theme = this.themes.collection[0];
        }
    }

    public destroy(): void {
        this._theme = null;
        this.observer = null;
        if (this._themes) {
            this._themes.destroy();
            this._themes = null;
        }
    }

    public getStyle<T>(name: string): T {
        return this.theme ? this.theme.getStyle(name) : null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<string> {
        return this.observer.asObservable();
    }

    public get themes(): MapCollection<Theme> {
        return this._themes;
    }

    public get theme(): Theme {
        return this._theme;
    }
    public set theme(value: Theme) {
        if (value === this._theme) {
            return;
        }

        let element: HTMLElement = document.body;
        if (this._theme) {
            element.classList.remove(this._theme.styleName);
        }

        this._theme = value;
        CookieStorageUtil.put(this.options, this._theme ? this._theme.name : null);

        if (this._theme) {
            element.classList.add(this._theme.styleName);
        }
        this.observer.next(ThemeServiceEvent.CHANGED);
    }
}

export enum ThemeServiceEvent {
    CHANGED = 'CHANGED'
}

export interface IThemeServiceOptions extends ICookieStorageOptions {}
