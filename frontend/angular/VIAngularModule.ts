import { ModuleWithProviders, NgModule } from '@angular/core';
import { Logger } from '../../common/logger';
import { LoggerLevel } from '../../common/logger/ILogger';
import { DefaultLogger } from '../logger';
import { VIModule } from '../VIModule';
import { AssetModule } from './asset/AssetModule';
import { CookieModule, CookieOptions } from './cookie';
import { LanguageModule } from './language/LanguageModule';
import { LoginGuard, LoginRedirectResolver, LoginResolver } from './login';
import { NotificationModule } from './notification';
import { FinancePipe, MomentDateAdaptivePipe, MomentDatePipe, MomentTimePipe, NgModelErrorPipe, SanitizePipe, TruncatePipe } from './pipe';
import { ThemeModule } from './theme';
import { WindowModule } from './window';

@NgModule({
    declarations: [NgModelErrorPipe, FinancePipe, MomentDateAdaptivePipe, MomentDatePipe, MomentTimePipe, SanitizePipe, TruncatePipe],
    providers: [LoginResolver, LoginGuard, LoginRedirectResolver],
    exports: [
        VIModule,
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
        SanitizePipe,
        TruncatePipe
    ]
})
export class VIAngularModule {
    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static forRoot(settings?: IVIAngularSettings): ModuleWithProviders {
        return {
            ngModule: VIAngularModule,
            providers: [
                ...CookieModule.forRoot(settings).providers,
                { provide: Logger, useValue: new DefaultLogger(settings ? settings.loggerLevel : LoggerLevel.ALL) }
            ]
        };
    }
}

export interface IVIAngularSettings extends CookieOptions {
    loggerLevel: LoggerLevel;
}
