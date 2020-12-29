import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LanguageService } from '@ts-core/frontend/language';
import { CookieModule } from '../cookie/CookieModule';
import { WindowDragAreaDirective } from '../component/window/WindowDragAreaDirective';
import { CookieService } from '../cookie/CookieService';
import { LanguageModule } from '../language/LanguageModule';
import { WindowService } from './WindowService';

@NgModule({
    imports: [MatDialogModule, CookieModule, LanguageModule],
    declarations: [WindowDragAreaDirective],
    exports: [WindowDragAreaDirective]
})
export class WindowModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: WindowModule,
            providers: [
                {
                    provide: WindowService,
                    deps: [MatDialog, LanguageService, CookieService],
                    useClass: WindowService
                }
            ]
        };
    }
}
