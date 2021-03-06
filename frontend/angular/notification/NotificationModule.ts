import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { LanguageModule } from '../language';
import { NotificationService } from './NotificationService';
@NgModule({
    imports: [MatDialogModule, LanguageModule],
    providers: [NotificationService]
})
export class NotificationModule {}
