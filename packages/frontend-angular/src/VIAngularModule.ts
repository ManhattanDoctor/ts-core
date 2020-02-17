import { ModuleWithProviders, NgModule } from '@angular/core';
import { ILogger, Logger, LoggerLevel } from '@ts-core/common/logger';
import { ILanguageServiceOptions } from '@ts-core/frontend/language';
import { DefaultLogger } from '@ts-core/frontend/logger';
import { LoadingService, NativeWindowService } from '@ts-core/frontend/service';
import { IThemeServiceOptions } from '@ts-core/frontend/theme';
import { CookieModule, CookieOptions } from './cookie';
import {
    AspectRatioResizeDirective,
    AutoScrollBottomDirective,
    ClickToCopyDirective,
    ClickToSelectDirective,
    FocusDirective,
    InfiniteScrollDirective,
    ResizeDirective,
    ScrollDirective
} from './directive';
import { LanguageModule } from './language';
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
import { ThemeModule } from './theme';

const IMPORTS = [CookieModule, ThemeModule, LanguageModule];

const DECLARATIONS = [
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
];

@NgModule({
    declarations: DECLARATIONS
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
                LoadingService,
                NativeWindowService,

                { provide: VIAngularSettings, useValue: settings || {} },
                { provide: Logger, deps: [VIAngularSettings], useFactory: loggerFactory },

                ...CookieModule.forRoot(settings).providers,
                ...ThemeModule.forRoot(settings ? settings.themeOptions : null).providers,
                ...LanguageModule.forRoot(settings ? settings.languageOptions : null).providers
            ]
        };
    }
}

export class VIAngularSettings extends CookieOptions {
    loggerLevel?: LoggerLevel = LoggerLevel.ALL;
    themeOptions?: IThemeServiceOptions;
    languageOptions?: ILanguageServiceOptions;
}

export function loggerFactory(settings: VIAngularSettings): ILogger {
    if (!settings) {
        settings = new VIAngularSettings();
    }
    return new DefaultLogger(settings.loggerLevel);
}
