import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { ArrayUtil } from '../../../common/util';
import { LanguageService } from '../language';
import { IQuestion, QuestionMode, QuestionOptions } from '../question';
import { WindowAlign, WindowConfig, WindowEvent } from '../window';
import { INotification, NotificationEvent } from './INotification';
import { INotificationContent } from './INotificationContent';
import { NotificationConfig } from './NotificationConfig';
import { NotificationFactory } from './NotificationFactory';

@Injectable()
export class NotificationService {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public factory: NotificationFactory<INotification>;
    public questionComponent: ComponentType<INotificationContent>;

    protected dialog: MatDialog;
    protected language: LanguageService;

    protected _configs: Array<NotificationConfig>;
    protected _notifications: Map<NotificationConfig, INotificationContent>;

    private observer: Subject<ObservableData<NotificationServiceEvent, INotification | NotificationConfig>>;

    public gapX: number = 0;
    public gapY: number = 25;

    public minWidth: number = 25;
    public minHeight: number = 25;

    public paddingTop: number = 25;
    public paddingLeft: number = 25;
    public paddingRight: number = 25;
    public paddingBottom: number = 25;

    public defaultVerticalAlign: WindowAlign = WindowAlign.START;
    public defaulthorizontalAlign: WindowAlign = WindowAlign.END;

    public defaultCloseDuration: number = 5000;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(dialog: MatDialog, language: LanguageService) {
        this._configs = [];
        this._notifications = new Map();

        this.dialog = dialog;
        this.language = language;
        this.observer = new Subject();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public openNotification(component: ComponentType<INotificationContent>, config: NotificationConfig): INotificationContent {
        let notification = null;
        if (!_.isNil(config.id)) {
            notification = this.notifications.get(notification.id);
            if (notification) {
                return notification.content;
            }
        }

        this.setDefaultProperties(config);

        let reference: MatDialogRef<INotificationContent> = this.dialog.open(component, config);
        notification = this.factory.create({ config, reference, overlay: (reference as any)._overlayRef });

        let subscription = notification.events.subscribe(data => {
            if (data === NotificationEvent.REMOVED) {
                subscription.unsubscribe();
                this.remove(config);
            } else if (data === WindowEvent.CLOSED) {
                this.close(config);
            } else if (data === WindowEvent.OPENED) {
                this.add(config, reference.componentInstance);
                this.checkPosition(notification);
                if (config.sound) {
                    // Assets.playSound(config.sound);
                }
            }
        });
        return notification.content;
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    private setDefaultProperties(config: NotificationConfig): void {
        if (!config.verticalAlign) {
            config.verticalAlign = this.defaultVerticalAlign;
        }
        if (!config.horizontalAlign) {
            config.horizontalAlign = this.defaulthorizontalAlign;
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

        if (_.isNaN(config.closeDuration)) {
            config.closeDuration = this.defaultCloseDuration;
        }

        config.setDefaultProperties();
    }

    private checkPosition(item: INotification): void {
        while (this.hasWithSamePosition(item)) {
            item.move(item.getX() + this.gapX, item.getY() + this.gapY);
        }
    }

    private hasWithSamePosition(itemNotification: INotification): boolean {
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

    //--------------------------------------------------------------------------
    //
    // 	Setters Methods
    //
    //--------------------------------------------------------------------------

    private add(config: NotificationConfig, content: INotificationContent): void {
        if (content) {
            this._configs.push(config);
            this.observer.next(new ObservableData(NotificationServiceEvent.ADDED, config));
        }

        this._notifications.set(config, content);
        this.observer.next(new ObservableData(NotificationServiceEvent.OPENED, content.notification));
    }

    //--------------------------------------------------------------------------
    //
    // 	Help Methods
    //
    //--------------------------------------------------------------------------

    public open(config: NotificationConfig): INotificationContent {
        return this.openNotification(this.questionComponent, config);
    }

    public remove(item: NotificationConfig): void {
        this.close(item);
        ArrayUtil.remove(this._configs, item);
        this.observer.next(new ObservableData(NotificationServiceEvent.REMOVED, item));
        item.destroy();
    }

    public close(config: NotificationConfig): INotification {
        let item = this._notifications.get(config);
        if (!item) {
            return null;
        }

        item.close();
        this._notifications.delete(config);
        this.observer.next(new ObservableData(NotificationServiceEvent.CLOSED, item.notification));
    }

    public info(translationId?: string, translation?: any, options?: QuestionOptions): IQuestion {
        let text = this.language.translate(translationId, translation);
        let config = new NotificationConfig(text);

        let content: IQuestion = this.open(config) as any;
        content.initialize(_.assign(options, { mode: QuestionMode.INFO, text }));
        return content;
    }

    public question(translationId?: string, translation?: any, options?: QuestionOptions): IQuestion {
        let text = this.language.translate(translationId, translation);
        let config = new NotificationConfig(text);
        // config.closeDuration = 0;

        let content: IQuestion = this.open(config) as any;
        content.initialize(_.assign(options, { mode: QuestionMode.QUESTION, text }));
        return content;
    }
    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get events(): Observable<ObservableData<NotificationServiceEvent, NotificationConfig | INotification>> {
        return this.observer.asObservable();
    }

    public get configs(): Array<NotificationConfig> {
        return this._configs;
    }

    public get notifications(): Map<NotificationConfig, INotificationContent> {
        return this._notifications;
    }
}

export enum NotificationServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    ADDED = 'ADDED',
    REMOVED = 'REMOVED'
}
