import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ApiResponse } from '@ts-core/common/api';
import { Logger } from '@ts-core/common/logger';
import {
    ApplicationComponent,
    LoginResolver,
    NotificationBaseComponent,
    NotificationComponent,
    NotificationFactory,
    NotificationService,
    PipeBaseService,
    QuestionComponent,
    RouterBaseService,
    ViewUtil,
    WindowBaseComponent,
    WindowFactory,
    WindowService
} from '@ts-core/frontend-angular';
import { Language, LanguageService } from '@ts-core/frontend/language';
import { LoadingService, LoadingServiceManager, NativeWindowService } from '@ts-core/frontend/service';
import { ThemeService } from '@ts-core/frontend/theme';
import { ApiService } from '../../service/ApiService';
import { SettingsService } from '../../service/SettingsService';
import { TransportHttp } from '../../transport/TransportHttp';
import { TransportHttpCommandAsync } from '../../transport/TransportHttpCommandAsync';

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
        private windows: WindowService,
        private router: RouterBaseService,
        private notifications: NotificationService,
        public loading: LoadingService,
        private pipe: PipeBaseService,
        private nativeWindow: NativeWindowService,
        element: ElementRef,
        protected renderer: Renderer2,
        protected settings: SettingsService,
        protected language: LanguageService,
        protected theme: ThemeService,
        protected logger: Logger,
        protected api: ApiService
    ) {
        super(element, 0);

        this.test();
    }

    private async test() {
        let transport = new TransportHttp(this.logger);
        transport.defaults = { baseURL: `http://localhost:3000/api` };

        try {
            console.log(
                await transport.sendListen(
                    new TransportHttpCommandAsync({
                        name: `login`,
                        data: {
                            login: 'admin@n-t.io',
                            password:
                                'ab9b12dd97c259eab7a26909a9eb5b2ba46e43604d8d412f66bf8ef3de03923117fc1d98477e503e82a3897c338f5f9cb9b91695eb2a677344b0e903fc888d67'
                        },
                        method: 'post'
                    })
                )
            );
        } catch (error) {
            console.log(error);
        }
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    protected initialize(): void {
        this.windows.factory = new WindowFactory(WindowBaseComponent);
        this.windows.questionComponent = QuestionComponent;

        this.notifications.factory = new NotificationFactory(NotificationBaseComponent);
        this.notifications.questionComponent = NotificationComponent;

        super.initialize();

        ViewUtil.addClasses(this.element, 'h-100 d-block');
        this.initializeObservers();

        this.theme.loadIfExist(this.settings.theme);
        this.language.loadIfExist(this.settings.language);
    }

    private initializeObservers(): void {
        let manager = this.addDestroyable(new LoadingServiceManager(this.loading));
        manager.addLoadable(this.api);
        manager.addLoadable(this.language);
    }

    private async redirect(): Promise<void> {
        let url = LoginResolver.redirectUrl;
        this.router.navigate(url);
    }

    //--------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    //--------------------------------------------------------------------------

    protected async apiLoadingError(item: ApiResponse): Promise<void> {}

    protected languageLoadingError(item: Language, error: Error): void {
        let message = `Unable to load language ${item.locale}`;
        if (error) {
            message += `, error: ${error}`;
        }
    }

    protected readyHandler(): void {}

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
