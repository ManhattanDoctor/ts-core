import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/internal/operators';
import { ViewUtil } from '../util/ViewUtil';
import { WindowEvent } from '../window/IWindow';
import { WindowBase } from '../window/WindowBase';
import { INotification, NotificationEvent } from './INotification';
import { INotificationContent } from './INotificationContent';
import { NotificationConfig } from './NotificationConfig';
import { NotificationProperties } from './NotificationProperties';

export class Notification extends WindowBase implements INotification {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _container: HTMLElement;

    protected properties: NotificationProperties;

    protected timer: any;
    protected observer: Subject<string>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(properties: NotificationProperties) {
        super();
        this.observer = new Subject();

        this.properties = properties;
        this.content.notification = this;

        // Have to save for unsubscribe on destroy
        this._container = this.properties.overlay.overlayElement;

        this.setProperties();
        this.setPosition();

        this.getReference()
            .afterOpen()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.setOpened);

        this.getReference()
            .afterClosed()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.setClosed);

        this.observer
            .pipe(
                filter(event => event === WindowEvent.CONTENT_READY),
                takeUntil(this.destroyed)
            )
            .subscribe(this.checkSizeAndUpdatePositionIfNeed);
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
        this.emit(WindowEvent.CLOSED);
        this.destroy();
    };

    protected setOpened = (): void => {
        this.emit(WindowEvent.OPENED);
    };

    protected getConfig(): NotificationConfig {
        return this.properties.config;
    }
    protected getContainer(): HTMLElement {
        return this.container;
    }
    protected getReference(): MatDialogRef<INotificationContent> {
        return this.properties.reference;
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
        this.getReference().close();
    }

    public remove(): void {
        this.close();
        this.observer.next(NotificationEvent.REMOVED);
    }

    public destroy(): void {
        super.destroy();
        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
        this.properties = null;
        this._container = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Size Methods
    //
    // --------------------------------------------------------------------------

    public getWidth(): number {
        return this.calculateWidth();
    }

    public getHeight(): number {
        return this.calculateHeight();
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
        return this.properties.config;
    }

    public get content(): INotificationContent {
        return this.properties.reference ? this.properties.reference.componentInstance : null;
    }

    public get container(): HTMLElement {
        return this._container;
    }
}
