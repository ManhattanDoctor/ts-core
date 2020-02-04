import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatSelectModule } from '@angular/material';
import { VIAngularModule } from '../VIAngularModule';
import { LanguageSelectorComponent } from './language';
import { NotificationComponent } from './notification';
import { CloseWindowElementComponent, MinimizeWindowElementComponent, QuestionComponent, ResizeWindowElementComponent } from './window';

let ENTRY_COMPONENTS = [QuestionComponent, NotificationComponent, CloseWindowElementComponent, ResizeWindowElementComponent, MinimizeWindowElementComponent];
let DECLARATIONS = [LanguageSelectorComponent, ...ENTRY_COMPONENTS];

@NgModule({
    imports: [CommonModule, FormsModule, MatSelectModule, MatButtonModule, VIAngularModule],
    declarations: DECLARATIONS,
    entryComponents: ENTRY_COMPONENTS,
    exports: [...DECLARATIONS]
})
export class VIAngularComponentModule {}
