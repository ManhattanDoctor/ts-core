import { OverlayRef } from '@angular/cdk/overlay';
import { MatDialogRef } from '@angular/material/dialog';
import { INotificationContent } from './INotificationContent';
import { NotificationConfig } from './NotificationConfig';

export interface NotificationProperties {
    reference?: MatDialogRef<INotificationContent>;
    config?: NotificationConfig;
    overlay?: OverlayRef;
}
