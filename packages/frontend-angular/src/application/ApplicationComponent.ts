import { Renderer2 } from '@angular/core';
import { LoadableEvent } from '@ts-core/common';
import { Assets } from '@ts-core/frontend/asset';
import { Language, LanguageService } from '@ts-core/frontend/language';
import { SettingsBaseService } from '@ts-core/frontend/service';
import { ThemeService } from '@ts-core/frontend/theme';
import moment from 'moment';
import numeral from 'numeral';
import { takeUntil } from 'rxjs/operators';
import { ViewUtil } from '../util/ViewUtil';
import { ApplicationBaseComponent } from './ApplicationBaseComponent';

export abstract class ApplicationComponent<T extends SettingsBaseService> extends ApplicationBaseComponent {
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

        // Language
        this.language.initialize(Assets.languagesUrl, this.settings.languages);
        this.language.events.pipe(takeUntil(this.destroyed)).subscribe(data => {
            switch (data.type) {
                case LoadableEvent.COMPLETE:
                    this.languageLoadingComplete(data.data);
                    break;
                case LoadableEvent.ERROR:
                    this.languageLoadingError(data.data, data.error);
                    break;
            }
        });
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
        this.isLanguageLoaded = true;
        this.checkReady();
    }

    protected viewReadyHandler(): void {
        this.initialize();
    }

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

    protected abstract get settings(): T;

    protected abstract get theme(): ThemeService;
    protected abstract get language(): LanguageService;
    protected abstract get renderer(): Renderer2;
}
