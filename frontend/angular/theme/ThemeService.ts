import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { MapCollection } from '../../../common/map';
import { Destroyable } from '../../Destroyable';
import { CookieService } from '../cookie';
import { ViewUtil } from '../util';
import { Theme } from './Theme';

@Injectable()
export class ThemeService extends Destroyable {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    private _theme: Theme;
    private _themes: MapCollection<Theme>;

    private observer: Subject<string>;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(protected cookies: CookieService) {
        super();
        this.observer = new Subject();
        this._themes = new MapCollection('name');
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public initialize(themes: Array<any>, defaultTheme: string): void {
        this.themes.clear();

        if (!_.isEmpty(themes)) {
            for (let item of themes) {
                let theme = new Theme();
                theme.update(item);
                this.themes.add(theme);
            }
        }

        let name = defaultTheme;
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

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

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
        if (this._theme && document) {
            ViewUtil.removeClass(document.body, this._theme.styleName);
        }

        this._theme = value;
        this.observer.next(ThemeServiceEvent.CHANGED);

        if (this._theme) {
            this.cookies.put('vi-theme', this._theme.name);
            if (document) {
                ViewUtil.addClass(document.body, this._theme.styleName);
            }
        } else {
            this.cookies.remove('vi-theme');
        }
    }
}

export enum ThemeServiceEvent {
    CHANGED = 'CHANGED'
}
