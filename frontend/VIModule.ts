import { ModuleWithProviders, NgModule } from '@angular/core';
import { LoadingService } from './service/LoadingService';
import { NativeWindowService } from './service/NativeWindowService';

@NgModule({
    providers: [LoadingService, NativeWindowService]
})
export class VIModule {
    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    public static forRoot(): ModuleWithProviders {
        return { ngModule: VIModule, providers: [LoadingService, NativeWindowService] };
    }
}
