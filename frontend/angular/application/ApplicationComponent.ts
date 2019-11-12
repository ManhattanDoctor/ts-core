import { Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { LoadableEvent } from '../../../common';
import { ApiBaseService, ApiResponse } from '../../api';
import { Assets } from '../../asset';
import { Language } from '../../language';
import { SettingsBaseService } from '../../service';
import { LanguageService } from '../language';
import { ThemeService } from '../theme';
import { ViewUtil } from '../util';
import { ApplicationBaseComponent } from './ApplicationBaseComponent';

export abstract class ApplicationComponent<S extends SettingsBaseService, A extends ApiBaseService> extends ApplicationBaseComponent {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private isLanguageLoaded: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        // View
        ViewUtil.initialize(this.renderer);

        // Settings
        this.settings.initialize(this.config, this.routerParams);

        // Assets
        Assets.initialize(this.settings.assetsUrl);

        // Theme
        this.theme.initialize(this.settings.themes);

        // Api Error
        this.api.url = this.settings.apiUrl;
        this.addSubscription(
            this.api.events.subscribe(data => {
                switch (data.type) {
                    case LoadableEvent.ERROR:
                        this.apiLoadingError(data.data as ApiResponse);
                        break;
                }
            })
        );

        // Language
        this.language.initialize(Assets.languagesUrl, this.settings.languages);
        this.addSubscription(
            this.language.events.subscribe(data => {
                switch (data.type) {
                    case LoadableEvent.COMPLETE:
                        this.languageLoadingComplete(data.data);
                        break;
                    case LoadableEvent.ERROR:
                        this.languageLoadingError(data.data, data.error);
                        break;
                }
            })
        );
    }

    protected isReady(): boolean {
        return super.isReady() && this.isLanguageLoaded;
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    protected languageLoadingComplete(item: Language): void {
        moment.locale(item.locale);
        numeral.locale(item.locale);
        this.api.locale = item.locale;
        this.isLanguageLoaded = true;
        this.checkReady();
    }

    protected viewReadyHandler(): void {
        this.initialize();
    }

    protected abstract apiLoadingError(item: ApiResponse): void;

    protected abstract languageLoadingError(item: Language, error: Error): void;

    // --------------------------------------------------------------------------
    //
    // 	Protected Properties
    //
    // --------------------------------------------------------------------------

    protected abstract get config(): any;
    protected abstract get routerParams(): any;

    // --------------------------------------------------------------------------
    //
    // 	Protected Service Properties
    //
    // --------------------------------------------------------------------------

    protected abstract get api(): A;
    protected abstract get settings(): S;

    protected abstract get theme(): ThemeService;
    protected abstract get language(): LanguageService;
    protected abstract get renderer(): Renderer2;
}

declare let numeral: any;
