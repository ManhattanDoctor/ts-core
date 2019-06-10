import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { ObjectUtil } from '../../../common/util/ObjectUtil';
import { ApiError } from '../../api';
import { LanguageService } from '../language';
import { WindowAlign } from '../window';
import { INotificationContent } from './component';
import { INotification, NotificationEvent } from './INotification';
import { NotificationConfig } from './NotificationConfig';
import { NotificationFactory } from './NotificationFactory';

export class NotificationBaseService {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public factory: NotificationFactory<INotification>;
    public defaultNotification: ComponentType<INotificationContent>;

    protected dialog: MatDialog;
    protected language: LanguageService;

    protected _configs: Array<NotificationConfig>;
    protected _notifications: Map<NotificationConfig, INotificationContent>;

    private observer: Subject<ObservableData<NotificationServiceEvent, INotification | NotificationConfig>>;

    protected gap: number;
    protected infoDuration: number;
    protected errorDuration: number;

    protected minWidth: number;
    protected minHeight: number;

    protected paddingTop: number;
    protected paddingLeft: number;
    protected paddingRight: number;
    protected paddingBottom: number;

    protected verticalAlign: WindowAlign;
    protected horizontalAlign: WindowAlign;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(dialog: MatDialog, language: LanguageService) {
        this._configs = [];
        this._notifications = new Map();

        this.dialog = dialog;
        this.language = language;
        this.observer = new Subject();

        this.gap = 25;
        this.minWidth = this.minHeight = 25;
        this.paddingTop = this.paddingLeft = this.paddingBottom = this.paddingRight = 25;

        this.verticalAlign = WindowAlign.START;
        this.horizontalAlign = WindowAlign.END;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public openNotification(component: ComponentType<INotificationContent>, config: NotificationConfig): INotificationContent {
        let notification: INotification = null;
        if (config.id) {
            notification = this.notifications[config.id];
            if (notification) {
                return notification.content;
            }
        }

        if (!config.verticalAlign) {
            config.verticalAlign = this.verticalAlign;
        }
        if (!config.horizontalAlign) {
            config.horizontalAlign = this.horizontalAlign;
        }

        if (_.isNaN(config.defaultMinWidth)) {
            config.defaultMinWidth = this.minWidth;
        }
        if (_.isNaN(config.defaultMinHeight)) {
            config.defaultMinHeight = this.minHeight;
        }

        if (_.isNaN(config.paddingTop)) {
            config.paddingTop = this.paddingTop;
        }
        if (_.isNaN(config.paddingLeft)) {
            config.paddingLeft = this.paddingLeft;
        }
        if (_.isNaN(config.paddingRight)) {
            config.paddingRight = this.paddingRight;
        }
        if (_.isNaN(config.paddingBottom)) {
            config.paddingBottom = this.paddingBottom;
        }

        config.setDefaultProperties();

        let reference: MatDialogRef<INotificationContent> = this.dialog.open(component, config);
        notification = this.factory.create(reference, config, (reference as any)._overlayRef) as INotification;

        let content: INotificationContent = notification.content;
        let subscription: Subscription = notification.events.subscribe(data => {
            if (data === NotificationEvent.REMOVED) {
                subscription.unsubscribe();
                this.remove(config);
            } else if (data === NotificationEvent.CLOSED) {
                this.close(config);
            } else if (data === NotificationEvent.OPENED) {
                this.add(config, reference.componentInstance);
                this.checkNotificationPosition(notification);

                if (config.sound) {
                    // Assets.playSound(config.sound);
                }
            }
        });

        return content;
    }

    public add(config: NotificationConfig, content: INotificationContent): void {
        if (content) {
            this._configs.push(config);
            this.observer.next(new ObservableData(NotificationServiceEvent.ADDED, config));
        }

        this._notifications.set(config, content);
        this.observer.next(new ObservableData(NotificationServiceEvent.OPENED, content.notification));
    }

    public remove(config: NotificationConfig): void {
        this.close(config);
        _.remove(this._configs, config);
        this.observer.next(new ObservableData(NotificationServiceEvent.REMOVED, config));
        config.destroy();
    }

    public removeById(id: string): void {
        if (this._configs.length > 0) {
            return;
        }

        this._configs.forEach(config => {
            if (config.id && config.id === id) this.remove(config);
        });
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private close(config: NotificationConfig): INotification {
        let item = this._notifications.get(config);
        if (!item) {
            return null;
        }

        item.close();
        this._notifications.delete(config);
        this.observer.next(new ObservableData(NotificationServiceEvent.CLOSED, item.notification));
    }

    private checkNotificationPosition(notification: INotification): void {
        while (this.hasNotificationWithSamePosition(notification)) {
            notification.setY(notification.getY() + this.gap);
        }
    }

    private hasNotificationWithSamePosition(itemNotification: INotification): boolean {
        let y = itemNotification.getY();

        let result = false;
        this._notifications.forEach(content => {
            let notification = content.notification;
            if (notification !== itemNotification && y === notification.getY()) {
                result = true;
            }
        });
        return result;
    }

    // --------------------------------------------------------------------------
    //
    // 	Help Methods
    //
    // --------------------------------------------------------------------------

    public open(config: NotificationConfig): INotificationContent {
        config.isModal = false;
        return this.openNotification(this.defaultNotification, config);
    }

    public error(error: ErrorType, picture?: string, duration: number = NaN, removeAfterClose?: boolean, iconId?: string): void {
        if (!error) {
            return;
        }
        let item = new NotificationConfig();
        if (_.isString(error)) {
            item.data = error;
        } else if (ObjectUtil.hasOwnProperty(error, 'message')) {
            item.data = error.message;
        }

        item.iconId = iconId;
        item.picture = picture;
        item.closeDuration = !_.isNaN(duration) ? duration : this.errorDuration;
        item.isRemoveAfterClose = removeAfterClose;

        this.open(item);
    }
    public errorTranslate(translationId: string, translation?: any): void {
        this.error(this.language.translate(translationId, translation));
    }

    public info(text: string, picture?: string, duration: number = NaN, removeAfterClose?: boolean, iconId?: string): void {
        if (_.isEmpty(text)) {
            return;
        }

        let item = new NotificationConfig();
        item.data = text;
        item.iconId = iconId;
        item.picture = picture;
        item.closeDuration = !_.isNaN(duration) ? duration : this.infoDuration;
        item.isRemoveAfterClose = removeAfterClose;

        this.open(item);
    }
    public infoTranslate(
        translationId: string,
        translation?: any,
        picture?: string,
        closeDuration?: number,
        removeAfterClose?: boolean,
        iconId?: string
    ): void {
        this.info(this.language.translate(translationId, translation), picture, closeDuration, removeAfterClose, iconId);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<NotificationServiceEvent, NotificationConfig | INotification>> {
        return this.observer.asObservable();
    }

    public get notifications(): Map<NotificationConfig, INotificationContent> {
        return this._notifications;
    }

    public get configs(): Array<NotificationConfig> {
        return this._configs;
    }
}

export type ErrorType = Error | ApiError | string;

export enum NotificationServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    ADDED = 'ADDED',
    REMOVED = 'REMOVED'
}
