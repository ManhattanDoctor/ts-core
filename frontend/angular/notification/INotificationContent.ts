import { AfterViewInit, Input, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { DestroyableContainer } from '../../../common';
import { WindowEvent } from '../window';
import { INotification } from './INotification';
import { NotificationConfig } from './NotificationConfig';

export abstract class INotificationContent extends DestroyableContainer implements AfterViewInit {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    protected timer: any;
    protected _config: NotificationConfig;
    protected _notification: INotification;

    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor(public container: ViewContainerRef) {
        super();
    }

    //--------------------------------------------------------------------------
    //
    //  Private Methods
    //
    //--------------------------------------------------------------------------

    protected commitNotificationProperties(): void {
        this.clearTimer();
        if (this.config.closeDuration > 0) {
            this.timer = setTimeout(this.timerHandler, this.config.closeDuration);
        }
    }

    protected commitConfigProperties(): void {}

    protected clearTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    protected timerHandler = (): void => {
        this.handleCloseClick();
    };

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------

    public close(): void {
        if (this.notification) {
            this.notification.close();
        }
    }

    public remove(): void {
        if (this.notification) {
            this.notification.remove();
        }
    }

    public emit(event: string): void {
        if (this.notification) {
            this.notification.emit(event);
        }
    }

    public destroy(): void {
        super.destroy();
        this.clearTimer();
        this.notification = null;
    }

    //--------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //--------------------------------------------------------------------------

    public ngAfterViewInit(): void {
        this.emit(WindowEvent.CONTENT_READY);
    }

    public handleCloseClick(): void {
        this.clearTimer();
        if (this.config && this.config.isRemoveAfterClose) {
            this.remove();
        } else {
            this.close();
        }
    }

    //--------------------------------------------------------------------------
    //
    //  Proxy Public Properties
    //
    //--------------------------------------------------------------------------

    public get data(): any {
        return this.config ? this.config.data : null;
    }

    public get events(): Observable<string> {
        return this.notification ? this.notification.events : null;
    }

    //--------------------------------------------------------------------------
    //
    //  Public Properties
    //
    //--------------------------------------------------------------------------

    public get notification(): INotification {
        return this._notification;
    }
    public set notification(value: INotification) {
        if (value === this._notification) {
            return;
        }
        this._notification = value;
        this.config = value ? value.config : null;
        if (this._notification) {
            this.commitNotificationProperties();
        }
    }

    public get config(): NotificationConfig {
        return this._config;
    }
    @Input()
    public set config(value: NotificationConfig) {
        if (value === this._config) {
            return;
        }
        this._config = value;
        if (this._config) {
            this.commitConfigProperties();
        }
    }
}
