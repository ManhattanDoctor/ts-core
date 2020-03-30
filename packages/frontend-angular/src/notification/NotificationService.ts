import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ObservableData } from '@ts-core/common/observer';
import { ArrayUtil, ObjectUtil } from '@ts-core/common/util';
import { LanguageService } from '@ts-core/frontend/language';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { IQuestion, IQuestionOptions, QuestionMode } from '../question/IQuestion';
import { QuestionManager } from '../question/QuestionManager';
import { WindowEvent } from '../window/IWindow';
import { WindowAlign } from '../window/WindowConfig';
import { INotification, NotificationEvent } from './INotification';
import { INotificationContent } from './INotificationContent';
import { NotificationConfig, NotificationConfigOptions } from './NotificationConfig';
import { NotificationFactory } from './NotificationFactory';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public factory: NotificationFactory<INotification>;
    public questionComponent: ComponentType<INotificationContent<any>>;

    protected dialog: MatDialog;
    protected language: LanguageService;

    protected _configs: Array<NotificationConfig>;
    protected _closedConfigs: Array<NotificationConfig>;
    protected _notifications: Map<NotificationConfig, INotificationContent<any>>;

    private observer: Subject<ObservableData<NotificationServiceEvent, INotification | NotificationConfig>>;

    public gapY: number = 25;

    public minWidth: number = 25;
    public minHeight: number = 25;

    public paddingTop: number = 25;
    public paddingLeft: number = 25;
    public paddingRight: number = 25;
    public paddingBottom: number = 25;

    public defaultCloseDuration: number = 3000;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(dialog: MatDialog, language: LanguageService) {
        this._configs = [];
        this._closedConfigs = [];
        this._notifications = new Map();

        this.dialog = dialog;
        this.language = language;
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public open<T>(component: ComponentType<INotificationContent<T>>, config: NotificationConfig): INotificationContent<T> {
        let notification = null;
        if (!_.isNil(config.id)) {
            notification = this.getById(config.id);
            if (notification) {
                return notification.content;
            }
        }

        this.setDefaultProperties(config);

        let reference: MatDialogRef<INotificationContent<T>> = this.dialog.open(component, config);
        notification = this.factory.create({ config, reference, overlay: (reference as any)._overlayRef });

        let subscription = notification.events.subscribe(event => {
            switch (event) {
                case WindowEvent.OPENED:
                    this.add(config, reference.componentInstance);
                    this.checkPosition(notification);
                    if (config.sound) {
                        // Assets.playSound(config.sound);
                    }
                    break;

                case WindowEvent.CLOSED:
                    subscription.unsubscribe();
                    this.close(config);
                    break;

                case NotificationEvent.REMOVED:
                    subscription.unsubscribe();
                    this.remove(config);
                    break;
            }
        });
        return notification.content;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private getById(id: string): INotification {
        let value = null;
        this._notifications.forEach(item => {
            if (item.config.id === id) {
                value = item;
                return true;
            }
        });
        return value;
    }

    private setDefaultProperties(config: NotificationConfig): void {
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

        config.verticalAlign = WindowAlign.START;
        config.horizontalAlign = WindowAlign.END;
        config.setDefaultProperties();
    }

    private checkPosition(item: INotification): void {
        let previous = this.getPrevious(item);
        if (previous) {
            item.setY(previous.getY() + previous.getHeight() + this.gapY);
        }
    }

    private getPrevious(value: INotification): INotification {
        if (this.notifications.size === 0) {
            return null;
        }

        let items = Array.from(this.notifications.values());
        for (let i = 0; i < items.length; i++) {
            if (items[i].notification === value) {
                if (i === 0) {
                    return null;
                }
                return items[i - 1].notification;
            }
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Setters Methods
    //
    // --------------------------------------------------------------------------

    private add<T>(config: NotificationConfig, content: INotificationContent<T>): void {
        this._configs.push(config);
        this.observer.next(new ObservableData(NotificationServiceEvent.ADDED, config));

        this._notifications.set(config, content);
        this.observer.next(new ObservableData(NotificationServiceEvent.OPENED, content.notification));
    }

    // --------------------------------------------------------------------------
    //
    // 	Help Methods
    //
    // --------------------------------------------------------------------------

    public get(value: NotificationId): NotificationConfig {
        if (_.isNil(value)) {
            return null;
        }
        if (value instanceof NotificationConfig) {
            return value;
        }

        let id = value.toString();
        if (ObjectUtil.instanceOf<NotificationConfigOptions>(value, ['id'])) {
            id = value.id;
        }
        for (let item of this.configs) {
            if (item.id === id) {
                return item;
            }
        }
        return null;
    }

    public has(value: NotificationId): boolean {
        return !_.isNil(this.get(value));
    }

    public remove(value: NotificationId): void {
        let config = this.get(value);
        if (_.isNil(config)) {
            return;
        }

        this.close(config);
        ArrayUtil.remove(this._configs, config);
        ArrayUtil.remove(this._closedConfigs, config);
        this.observer.next(new ObservableData(NotificationServiceEvent.REMOVED, config));
        config.destroy();
    }

    public removeAll(): void {
        this.configs.forEach(item => this.remove(item));
    }

    public close(value: NotificationId): INotification {
        let config = this.get(value);
        if (_.isNil(config)) {
            return;
        }

        let notification = this._notifications.get(config);
        if (!notification) {
            return null;
        }

        notification.close();
        this._notifications.delete(config);

        this._closedConfigs.push(config);
        this.observer.next(new ObservableData(NotificationServiceEvent.CLOSED, notification.notification));
    }

    public info(translationId?: string, translation?: any, questionOptions?: IQuestionOptions, configOptions?: NotificationConfigOptions): IQuestion {
        let text = this.language.translate(translationId, translation);
        let data = new QuestionManager(_.assign(questionOptions, { mode: QuestionMode.INFO, text }));
        let config = _.assign(new NotificationConfig(data), configOptions);
        return this.open(this.questionComponent, config).config.data;
    }

    public question(translationId?: string, translation?: any, questionOptions?: IQuestionOptions, configOptions?: NotificationConfigOptions): IQuestion {
        let text = this.language.translate(translationId, translation);
        let data = new QuestionManager(_.assign(questionOptions, { mode: QuestionMode.QUESTION, text }));
        let config = _.assign(new NotificationConfig(data), configOptions);
        return this.open(this.questionComponent, config).config.data;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<NotificationServiceEvent, NotificationConfig | INotification>> {
        return this.observer.asObservable();
    }

    public get configs(): Array<NotificationConfig> {
        return this._configs;
    }

    public get closedConfigs(): Array<NotificationConfig> {
        return this._closedConfigs;
    }

    public get notifications(): Map<NotificationConfig, INotificationContent<any>> {
        return this._notifications;
    }
}

export type NotificationId = string | NotificationConfig | NotificationConfigOptions;

export enum NotificationServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    ADDED = 'ADDED',
    REMOVED = 'REMOVED'
}
