import { MatDialogRef } from '@angular/material/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { IWindowContent } from './IWindowContent';
import { WindowConfig } from './WindowConfig';

export interface WindowProperties {
    reference?: MatDialogRef<IWindowContent>;
    config?: WindowConfig;
    overlay?: OverlayRef;
}
