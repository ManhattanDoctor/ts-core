import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatSelectModule } from '@angular/material';
import { AssetModule } from '../asset';
import { LanguageModule } from '../language';
import { ThemeModule } from '../theme';
import { LanguageSelectorComponent } from './language';
import { NotificationComponent } from './notification';
import { CloseWindowElementComponent, MinimizeWindowElementComponent, QuestionComponent, ResizeWindowElementComponent } from './window';

const IMPORTS = [CommonModule, FormsModule, MatSelectModule, MatButtonModule, LanguageModule, AssetModule, ThemeModule];
const ENTRY_COMPONENTS = [QuestionComponent, NotificationComponent, CloseWindowElementComponent, ResizeWindowElementComponent, MinimizeWindowElementComponent];
const DECLARATIONS = [LanguageSelectorComponent, ...ENTRY_COMPONENTS];
const EXPORTS = [...DECLARATIONS];

@NgModule({
    imports: IMPORTS,
    declarations: DECLARATIONS,
    entryComponents: ENTRY_COMPONENTS,
    exports: EXPORTS
})
export class VIAngularComponentModule {}
