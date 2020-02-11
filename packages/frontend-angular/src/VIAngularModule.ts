import { ModuleWithProviders, NgModule } from '@angular/core';
import { Logger } from '@ts-core/common/logger';
import { ILogger, LoggerLevel } from '@ts-core/common/logger/ILogger';
import { DefaultLogger } from '@ts-core/frontend/logger';
import { AssetModule } from './asset/AssetModule';
import { CookieModule, CookieOptions } from './cookie';
import {
    AutoScrollBottomDirective,
    AspectRatioResizeDirective,
    ClickToCopyDirective,
    ClickToSelectDirective,
    FocusDirective,
    InfiniteScrollDirective,
    ResizeDirective,
    ScrollDirective
} from './directive';
import { LanguageModule } from './language/LanguageModule';
import { LoginGuard, LoginRedirectResolver, LoginResolver } from './login';
import { NotificationModule } from './notification/NotificationModule';
import {
    CamelCasePipe,
    FinancePipe,
    MomentDateAdaptivePipe,
    MomentDateFromNowPipe,
    MomentDatePipe,
    MomentTimePipe,
    NgModelErrorPipe,
    SanitizePipe,
    StartCasePipe,
    TruncatePipe
} from './pipe';
import { ThemeModule } from './theme/ThemeModule';
import { WindowModule } from './window/WindowModule';

@NgModule({
    declarations: [
        NgModelErrorPipe,
        FinancePipe,
        MomentDateAdaptivePipe,
        MomentDatePipe,
        MomentTimePipe,
        MomentDateFromNowPipe,
        SanitizePipe,
        TruncatePipe,
        CamelCasePipe,
        StartCasePipe,

        FocusDirective,
        ResizeDirective,
        ScrollDirective,
        ClickToCopyDirective,
        ClickToSelectDirective,
        InfiniteScrollDirective,
        AutoScrollBottomDirective,
        AspectRatioResizeDirective
    ],
    providers: [LoginResolver, LoginGuard, LoginRedirectResolver],
    exports: [
        
        AssetModule,
        LanguageModule,
        WindowModule,
        NotificationModule,
        ThemeModule,

        NgModelErrorPipe,
        FinancePipe,
        MomentDateAdaptivePipe,
        MomentDatePipe,
        MomentTimePipe,
        MomentDateFromNowPipe,
        SanitizePipe,
        TruncatePipe,
        CamelCasePipe,
        StartCasePipe,

        FocusDirective,
        ResizeDirective,
        ScrollDirective,
        ClickToCopyDirective,
        ClickToSelectDirective,
        InfiniteScrollDirective,
        AutoScrollBottomDirective,
        AspectRatioResizeDirective
    ]
})
export class VIAngularModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings?: VIAngularSettings): ModuleWithProviders {
        return {
            ngModule: VIAngularModule,
            providers: [
                ...CookieModule.forRoot(settings).providers,
                { provide: VIAngularSettings, useValue: settings },
                { provide: Logger, deps: [VIAngularSettings], useFactory: loggerFactory }
            ]
        };
    }
}

export class VIAngularSettings extends CookieOptions {
    loggerLevel?: LoggerLevel = LoggerLevel.ALL;
}

export function loggerFactory(settings: VIAngularSettings): ILogger {
    if (!settings) {
        settings = new VIAngularSettings();
    }
    return new DefaultLogger(settings.loggerLevel);
}
