import { ApplicationRef, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VICommonModule } from '@ts-core/frontend-angular';
import { RootComponent } from './component/root/root.component';

export const imports: any[] = [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    // TestModule.forRoot(),
    VICommonModule.forRoot(),
];

export const providers: any[] = [];

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
