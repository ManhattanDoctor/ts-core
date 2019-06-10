import { NgModule } from '@angular/core';
import { LoadingService, NativeWindowService } from './service';

@NgModule({
    providers: [LoadingService, NativeWindowService]
})
export class VIModule {}
