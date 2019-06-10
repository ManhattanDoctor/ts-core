import { OverlayRef } from '@angular/cdk/overlay';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/internal/operators';
import { ViewUtil } from '../util';
import { WindowBase } from '../window';
import { INotificationContent } from './INotificationContent';
import { INotification, NotificationEvent } from './INotification';
import { NotificationConfig } from './NotificationConfig';

export class Notification extends WindowBase implements INotification {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _config: NotificationConfig;
    protected _overlay: OverlayRef;
    protected _reference: MatDialogRef<INotificationContent>;

    protected timer: any;
    protected observer: Subject<string>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(reference: MatDialogRef<INotificationContent>, config?: NotificationConfig, overlay?: OverlayRef) {
        super();
        this.observer = new Subject();

        this._config = config;
        this._overlay = overlay;
        this._reference = reference;

        this.content.notification = this;

        this.setProperties();
        this.setPosition();

        this.addSubscription(reference.afterOpen().subscribe(this.setOpened));
        this.addSubscription(reference.afterClosed().subscribe(this.setClosed));

        this.addSubscription(this.observer.pipe(filter(event => event === NotificationEvent.CONTENT_READY)).subscribe(this.checkSizeAndUpdatePositionIfNeed));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected setProperties(): void {
        super.setProperties();
        ViewUtil.addClass(this.container, 'notification');
    }

    protected setClosed = (): void => {
        this.emit(NotificationEvent.CLOSED);
        this.destroy();
    };

    protected setOpened = (): void => {
        this.emit(NotificationEvent.OPENED);
    };

    protected getConfig(): NotificationConfig {
        return this._config;
    }
    protected getContainer(): HTMLElement {
        return this.container;
    }
    protected getReference(): MatDialogRef<INotificationContent> {
        return this._reference;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public emit(event: string): void {
        this.observer.next(event);
    }

    public close(): void {
        if (this._reference) this._reference.close();
    }

    public remove(): void {
        this.close();
        this.observer.next(NotificationEvent.REMOVED);
    }

    public destroy(): void {
        super.destroy();

        this.observer = null;

        this._reference = null;
        this._overlay = null;
        this._config = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Size Methods
    //
    // --------------------------------------------------------------------------

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public setWidth(value: number): void {
        this.width = value;
    }

    public setHeight(value: number): void {
        this.height = value;
    }

    public setSize(width: number, height: number): void {
        this.setWidth(width);
        this.setHeight(height);
    }

    // --------------------------------------------------------------------------
    //
    //  Move Methods
    //
    // --------------------------------------------------------------------------

    public getX(): number {
        return this.x;
    }

    public setX(value: number): void {
        this.x = value;
    }

    public getY(): number {
        return this.y;
    }
    public setY(value: number): void {
        this.y = value;
    }

    public move(x: number, y: number): void {
        this.setX(x);
        this.setY(y);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<string> {
        return this.observer.asObservable();
    }

    public get config(): NotificationConfig {
        return this._config;
    }

    public get content(): INotificationContent {
        return this._reference.componentInstance;
    }

    public get container(): HTMLElement {
        return this._overlay.overlayElement;
    }
}
