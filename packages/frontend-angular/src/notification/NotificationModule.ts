import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LanguageService } from '@ts-core/frontend/language';
import { LanguageModule } from '../language/LanguageModule';
import { NotificationService } from './NotificationService';

@NgModule({
    imports: [MatDialogModule, LanguageModule],
    providers: [NotificationService]
})
export class NotificationModule {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: NotificationService,
            providers: [
                {
                    provide: NotificationService,
                    deps: [MatDialog, LanguageService],
                    useClass: NotificationService
                }
            ]
        };
    }
}
