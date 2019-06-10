import { AfterViewInit, ViewContainerRef } from '@angular/core';
import { LanguageService } from '../language';
import { QuestionBaseComponent } from '../window/component';
import { INotification, NotificationEvent } from './INotification';
import { NotificationConfig } from './NotificationConfig';

export abstract class INotificationContent extends QuestionBaseComponent implements AfterViewInit {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected timer: any;
    protected _notification: INotification;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(container: ViewContainerRef, protected language: LanguageService) {
        super(container, language);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitNotificationProperties(): void {
        if (!this.config) {
            return;
        }

        this.text = this.config.data;
        this.mode = this.config.mode;

        if (this.config.closeDuration) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.timerHandler, this.config.closeDuration);
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
        this.notification = null;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    public ngAfterViewInit(): void {
        this.emit(NotificationEvent.CONTENT_READY);
    }

    public handleCloseClick(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        if (this.config && this.config.isRemoveAfterClose) {
            this.remove();
        } else {
            this.close();
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get data(): any {
        return this.config ? this.config.data : null;
    }

    public get config(): NotificationConfig {
        return this.notification ? this.notification.config : null;
    }

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
}
