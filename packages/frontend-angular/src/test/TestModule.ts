import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({
    imports: [],
    declarations: [],
    exports: []
})
export class TestModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: TestModule,
            providers: [
                {
                    provide: TEST_OPTIONS,
                    useValue: 123
                }
                // ...CookieModule.forRoot().providers
            ]
        };
    }
}

export const TEST_OPTIONS = new InjectionToken<number>(`TEST_OPTIONS`);
