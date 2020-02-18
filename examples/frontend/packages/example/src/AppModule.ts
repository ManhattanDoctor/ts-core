import { ApplicationRef, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Api } from '@ts-core/common/api';
import { HttpApi } from '@ts-core/common/api/http';
import { PipeBaseService, RouterBaseService, VICommonModule, VIComponentModule } from '@ts-core/frontend-angular';
import { SettingsBaseService } from '@ts-core/frontend/service';
import { RootComponent } from './component/root/root.component';
import { ApiService } from './service/ApiService';
import { PipeService } from './service/PipeService';
import { RouterService } from './service/RouterService';
import { SettingsService } from './service/SettingsService';

export const imports: any[] = [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    RouterModule.forRoot([]),
    VIComponentModule,
    VICommonModule.forRoot({ themeOptions: { name: 'theme' }, languageOptions: { name: 'language' } })
];

export const providers: any[] = [
    ApiService,
    PipeService,
    RouterService,
    SettingsService,

    { provide: Api, useExisting: ApiService },
    { provide: HttpApi, useExisting: ApiService },
    { provide: PipeBaseService, useExisting: PipeService },
    { provide: RouterBaseService, useExisting: RouterService },
    { provide: SettingsBaseService, useClass: SettingsService }
];

export const declarations: Array<any> = [RootComponent];

export const entryComponents: any[] = [RootComponent];

@NgModule({
    entryComponents,
    declarations,
    providers,
    imports
})
export class AppModule {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private injector: Injector) {}

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public ngDoBootstrap(applicationRef: ApplicationRef): void {
        applicationRef.bootstrap(RootComponent);
    }
}
