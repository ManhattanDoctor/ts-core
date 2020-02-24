import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ApiResponse } from '@ts-core/common/api';
import { Logger } from '@ts-core/common/logger';
import { PromiseHandler } from '@ts-core/common/promise';
import { TransportCommandAsync } from '@ts-core/common/transport';
import { TransportHttp, TransportHttpCommandAsync } from '@ts-core/common/transport/http';
import { TransportLocal } from '@ts-core/common/transport/local';
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
import { CoinBlockMapCollection } from '../../service/CoinBlockMapCollection';
import { SettingsService } from '../../service/SettingsService';

@Component({
    selector: 'root',
    template: '<coin-block-table [table]="table"></coin-block-table>'
})
export class RootComponent extends ApplicationComponent<SettingsService> {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public table: CoinBlockMapCollection;

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
        protected logger: Logger
    ) {
        super(element, 0);

        this.test();
    }

    private async test() {
        let http = new TransportHttp(this.logger);
        http.defaults.baseURL = `http://localhost:3000/api`;

        console.log(
            await http.sendListen(
                new TransportHttpCommandAsync(`login`, {
                    data: {
                        login: 'admin@n-t.io',
                        password:
                            'b9b12dd97c259eab7a26909a9eb5b2ba46e43604d8d412f66bf8ef3de03923117fc1d98477e503e82a3897c338f5f9cb9b91695eb2a677344b0e903fc888d67'
                    },
                    method: 'post'
                })
            )
        );

        let transport = new TransportLocal(this.logger);
        transport.listen<any>('Hello').subscribe(async command => {
            await PromiseHandler.delay(1000);
            transport.complete(command, { name: 321 });
        });

        let value = await transport.sendListen(new TransportCommandAsync(`Hello`, { name: 123 }));
        console.log(value);

        
        this.table = new CoinBlockMapCollection(http);
        this.table.events.subscribe(data => {
            console.log(data);
        });
        

 
        /*
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
        */
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
