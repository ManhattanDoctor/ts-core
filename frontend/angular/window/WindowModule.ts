import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LanguageModule } from '../language';
import { WindowDragAreaDirective } from './WindowDragAreaDirective';
import { WindowBaseService } from './WindowBaseService';
@NgModule({
    imports: [CommonModule, MatDialogModule, LanguageModule],
    declarations: [WindowDragAreaDirective],
    providers: [
        // WindowBaseService,
        /*
        {
            provide: MatDialog,
            deps: [],
            useFactory: dialog => {
                return 123;
            }
        }
        */
    ],
    exports: [WindowDragAreaDirective]
})
export class WindowModule {}
