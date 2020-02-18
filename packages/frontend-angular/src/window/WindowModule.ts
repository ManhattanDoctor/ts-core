import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { WindowDragAreaDirective } from '../component/window/WindowDragAreaDirective';
import { LanguageModule } from '../language/LanguageModule';
import { WindowService } from './WindowService';
@NgModule({
    imports: [MatDialogModule, LanguageModule],
    declarations: [WindowDragAreaDirective],
    providers: [WindowService],
    exports: [WindowDragAreaDirective]
})
export class WindowModule {}
