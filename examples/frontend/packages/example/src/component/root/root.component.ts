import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ApiResponse } from '@ts-core/common/api';
import { ApplicationComponent, PipeBaseService, RouterBaseService, ViewUtil } from '@ts-core/frontend-angular';
import { Language, LanguageService } from '@ts-core/frontend/language';
import { NativeWindowService } from '@ts-core/frontend/service';
import { ThemeService } from '@ts-core/frontend/theme';
import { ApiService } from '../../service/ApiService';
import { SettingsService } from '../../service/SettingsService';

@Component({
    selector: 'root',
    template: ''
})
export class RootComponent extends ApplicationComponent<SettingsService, ApiService> {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(
        element: ElementRef,
        private pipe: PipeBaseService,
        private router: RouterBaseService,
        private nativeWindow: NativeWindowService,
        protected renderer: Renderer2,
        protected settings: SettingsService,
        protected language: LanguageService,
        protected theme: ThemeService,
        protected api: ApiService
    ) {
        super(element, 0);
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    protected initialize(): void {
        super.initialize();

        ViewUtil.addClasses(this.element, 'h-100 d-block');

        this.theme.loadIfExist(this.settings.theme);
        this.language.loadIfExist(this.settings.language);
    }

    //--------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    //--------------------------------------------------------------------------

    protected async apiLoadingError(item: ApiResponse): Promise<void> {}

    protected languageLoadingError(item: Language, error: Error): void {}

    protected readyHandler(): void {
        console.log(this.pipe.finance.transform(1000));
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Properties
    //
    //--------------------------------------------------------------------------

    protected get config(): any {
        return this.nativeWindow.window['viConfig'];
    }

    protected get routerParams(): any {
        return this.router.getParams();
    }
}
