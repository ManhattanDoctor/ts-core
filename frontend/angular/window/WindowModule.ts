import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LanguageModule } from '../language';
import { WindowDragAreaDirective } from './WindowDragAreaDirective';
import { WindowService } from './WindowService';
@NgModule({
    imports: [CommonModule, MatDialogModule, LanguageModule],
    declarations: [WindowDragAreaDirective],
    providers: [
        WindowService,
        {
            provide: 'TEST',
            deps: [],
            useFactory: dialog => {
                console.log(dialog);
                return 123;
            }
        }
    ],
    exports: [MatDialogModule, WindowDragAreaDirective]
})
export class WindowModule {}
