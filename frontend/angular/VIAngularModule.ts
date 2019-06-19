import { ModuleWithProviders, NgModule } from '@angular/core';
import { VIModule } from '../VIModule';
import { AssetModule } from './asset/AssetModule';
import { CookieModule, CookieOptions } from './cookie';
import { LanguageModule } from './language/LanguageModule';
import { NotificationModule } from './notification';
import { FinancePipe, MomentDateAdaptivePipe, MomentDatePipe, MomentTimePipe, NgModelErrorPipe, SanitizePipe, TruncatePipe } from './pipe';
import { ThemeModule } from './theme';
import { WindowModule } from './window';

@NgModule({
    declarations: [NgModelErrorPipe, FinancePipe, MomentDateAdaptivePipe, MomentDatePipe, MomentTimePipe, SanitizePipe, TruncatePipe],
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

    public static forRoot(options?: CookieOptions): ModuleWithProviders {
        return { ngModule: VIAngularModule, providers: [...CookieModule.forRoot(options).providers] };
    }
}
