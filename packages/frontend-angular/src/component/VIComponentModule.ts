import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatListModule, MatMenuModule, MatSelectModule, MatTabsModule } from '@angular/material';
import { VICommonModule } from '../VICommonModule';
import { LanguageSelectorComponent } from './language/language-selector/language-selector.component';
import { NotificationComponent } from './notification/notification/notification.component';
import { CloseWindowElementComponent } from './window/close-window-element/close-window-element.component';
import { MinimizeWindowElementComponent } from './window/minimize-window-element/minimize-window-element.component';
import { QuestionComponent } from './window/question/question.component';
import { MenuListComponent } from './menu-list/menu-list.component';
import { SelectListComponent } from './select-list/select-list.component';
import { TabGroupComponent } from './tab-group/tab-group.component';
import { ResizeWindowElementComponent } from './window/resize-window-element/resize-window-element.component';

const IMPORTS = [CommonModule, FormsModule, MatTabsModule, MatListModule, MatMenuModule, MatSelectModule, MatButtonModule, VICommonModule];
const ENTRY_COMPONENTS = [QuestionComponent, NotificationComponent, CloseWindowElementComponent, ResizeWindowElementComponent, MinimizeWindowElementComponent];
const DECLARATIONS = [LanguageSelectorComponent, TabGroupComponent, MenuListComponent, SelectListComponent, ...ENTRY_COMPONENTS];
const EXPORTS = [...DECLARATIONS];

@NgModule({
    imports: IMPORTS,
    declarations: DECLARATIONS,
    entryComponents: ENTRY_COMPONENTS,
    exports: EXPORTS
})
export class VIComponentModule {}
