import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { LanguageModule } from '../language';
import { WindowService } from './WindowService';
import { WindowDragAreaDirective } from './WindowDragAreaDirective';
@NgModule({
    imports: [MatDialogModule, LanguageModule],
    declarations: [WindowDragAreaDirective],
    providers: [WindowService],
    exports: [WindowDragAreaDirective]
})
export class WindowModule {}
