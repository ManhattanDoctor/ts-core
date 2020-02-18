import { AfterViewInit, Input, ViewContainerRef } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import { Observable } from 'rxjs';
import { WindowEvent } from '../window/IWindow';
import { INotification } from './INotification';
import { NotificationConfig } from './NotificationConfig';

export abstract class INotificationContent<T = any> extends DestroyableContainer implements AfterViewInit {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected timer: any;
    protected _config: NotificationConfig<T>;
    protected _notification: INotification<T>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(public container: ViewContainerRef) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitNotificationProperties(): void {
        this.config = this.notification.config;
    }

    protected commitConfigProperties(): void {
        this.clearTimer();
        if (this.config.closeDuration > 0) {
            this.timer = setTimeout(this.timerHandler, this.config.closeDuration);
        }
    }

    protected clearTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    protected timerHandler = (): void => {
        this.handleCloseClick();
    };

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

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
        this.config = null;
        this.notification = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

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

    // --------------------------------------------------------------------------
    //
    //  Proxy Public Properties
    //
    // --------------------------------------------------------------------------

    public get data(): T {
        return this.config ? this.config.data : null;
    }

    public get events(): Observable<string> {
        return this.notification ? this.notification.events : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get notification(): INotification {
        return this._notification;
    }
    public set notification(value: INotification) {
        if (value === this._notification) {
            return;
        }
        this._notification = value;
        if (this._notification) {
            this.commitNotificationProperties();
        }
    }

    @Input()
    public set config(value: NotificationConfig<T>) {
        if (value === this._config) {
            return;
        }
        this._config = value;
        if (this._config) {
            this.commitConfigProperties();
        }
    }
    public get config(): NotificationConfig<T> {
        return this._config;
    }
}
