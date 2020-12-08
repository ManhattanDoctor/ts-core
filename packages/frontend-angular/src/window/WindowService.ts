import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Destroyable } from '@ts-core/common';
import { ObservableData } from '@ts-core/common/observer';
import { LanguageService } from '@ts-core/frontend/language';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { CookieService } from '../cookie/CookieService';
import { IQuestion, IQuestionOptions, QuestionMode } from '../question/IQuestion';
import { QuestionManager } from '../question/QuestionManager';
import { ViewUtil } from '../util/ViewUtil';
import { IWindow, WindowEvent } from './IWindow';
import { IWindowContent } from './IWindowContent';
import { WindowAlign, WindowConfig, WindowConfigOptions } from './WindowConfig';
import { WindowFactory } from './WindowFactory';

@Injectable({ providedIn: 'root' })
export class WindowService extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public factory: WindowFactory<IWindow>;
    public questionComponent: ComponentType<IWindowContent>;
    public isNeedCheckPositionAfterOpen: boolean = true;

    protected dialog: MatDialog;
    protected language: LanguageService;

    private _windows: Map<WindowConfig, IWindowContent>;

    private observer: Subject<ObservableData<WindowServiceEvent, IWindow>>;
    private properties: PropertiesManager;

    public gapX: number = 25;
    public gapY: number = 25;

    public minWidth: number = 100;
    public minHeight: number = 100;

    public paddingTop: number = 25;
    public paddingLeft: number = 25;
    public paddingRight: number = 25;
    public paddingBottom: number = 25;

    public defaultVerticalAlign: WindowAlign = WindowAlign.CENTER;
    public defaultHorizontalAlign: WindowAlign = WindowAlign.CENTER;

    public topZIndex: number = 999;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(dialog: MatDialog, language: LanguageService, cookies: CookieService) {
        super();
        this._windows = new Map();

        this.dialog = dialog;
        this.language = language;
        this.observer = new Subject();
        this.properties = new PropertiesManager(cookies);
        /*
        let service = dialog as any;
        service.getOverlayStateModal = service._getOverlayState;
        service.getOverlayStateNonModal = function(config) {
            let state = this.getOverlayStateModal(config);
            state.hasBackdrop = false;
            return state;
        };
        */
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private sortFunction(first: IWindow, second: IWindow): number {
        let firstIndex = first.container ? parseInt(ViewUtil.getStyle(first.container.parentElement, 'zIndex'), 10) : -1;
        let secondIndex = second.container ? parseInt(ViewUtil.getStyle(second.container.parentElement, 'zIndex'), 10) : -1;
        return firstIndex > secondIndex ? -1 : 1;
    }

    private updateTop(): void {
        let zIndex = 0;
        let topWindow: IWindow = null;

        this.windowsArray.forEach(window => {
            if (window.container) {
                let wrapper = window.container.parentElement;

                let index = parseInt(ViewUtil.getStyle(wrapper, 'zIndex'), 10);
                if (zIndex < index) {
                    zIndex = index;
                    topWindow = window;
                }
            }
        });

        if (!topWindow || topWindow.isOnTop) {
            return;
        }
        topWindow.isOnTop = true;
        this.observer.next(new ObservableData(WindowServiceEvent.SETTED_ON_TOP, topWindow));
    }

    private setWindowOnTop(topWindow: IWindow): void {
        let currentIndex = this.topZIndex - 2;
        for (let window of this.windowsArray) {
            if (window.container) {
                window.isOnTop = window === topWindow;
                let zIndex = window.isOnTop ? this.topZIndex : currentIndex--;
                ViewUtil.setStyle(window.backdrop, 'zIndex', zIndex);
                ViewUtil.setStyle(window.wrapper, 'zIndex', zIndex);
            }
        }

        this.windowsArray.sort(this.sortFunction);
        this.observer.next(new ObservableData(WindowServiceEvent.SETTED_ON_TOP, topWindow));
    }

    private checkPosition(item: IWindow): void {
        while (this.hasSamePosition(item)) {
            item.move(item.getX() + this.gapX, item.getY() + this.gapY);
        }
    }

    private hasSamePosition(itemWindow: IWindow): boolean {
        let x = itemWindow.getX();
        let y = itemWindow.getY();

        let result = false;
        this.windowsArray.forEach(window => {
            if (window !== itemWindow && x === window.getX() && y === window.getY()) {
                result = true;
            }
        });
        return result;
    }

    // --------------------------------------------------------------------------
    //
    // 	Setters Methods
    //
    // --------------------------------------------------------------------------

    private add(config: WindowConfig, content: IWindowContent): void {
        this._windows.set(config, content);
        this.observer.next(new ObservableData(WindowServiceEvent.OPENED, content.window));
    }

    private remove(config: WindowConfig): void {
        let window = this._windows.get(config);
        if (!window) {
            return null;
        }

        window.close();
        this._windows.delete(config);
        this.observer.next(new ObservableData(WindowServiceEvent.CLOSED, window.window));
    }

    private getById<T>(id: string): IWindow<T> {
        let result: IWindowContent = null;
        this.windows.forEach(item => {
            if (item.config.id === id) {
                result = item;
                return true;
            }
        });
        return !_.isNil(result) ? result.window : null;
    }

    private setDefaultProperties(config: WindowConfig): void {
        if (!config.verticalAlign) {
            config.verticalAlign = this.defaultVerticalAlign;
        }
        if (!config.horizontalAlign) {
            config.horizontalAlign = this.defaultHorizontalAlign;
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

        if (config.propertiesId) {
            this.properties.load(config.propertiesId, config);
        }

        config.setDefaultProperties();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public open(component: ComponentType<IWindowContent>, config: WindowConfig): IWindowContent {
        let window = null;
        if (config.id) {
            window = this.getById(config.id);
            if (window) {
                return window.content;
            }
        }

        this.setDefaultProperties(config);

        // let dialog = this.dialog as any;
        // dialog._getOverlayState = config.isModal ? dialog.getOverlayStateModal : dialog.getOverlayStateNonModal;

        let reference: MatDialogRef<IWindowContent> = this.dialog.open(component, config);
        window = this.factory.create({ config, reference, overlay: (reference as any)._overlayRef });

        let subscription = window.events.subscribe(event => {
            switch (event) {
                case WindowEvent.OPENED:
                    this.add(config, reference.componentInstance);
                    this.setWindowOnTop(window);
                    if (this.isNeedCheckPositionAfterOpen) {
                        this.checkPosition(window);
                    }
                    break;

                case WindowEvent.CLOSED:
                    subscription.unsubscribe();
                    this.remove(config);
                    if (window.isOnTop && this.windows.size > 0) {
                        this.updateTop();
                    }
                    break;

                case WindowEvent.RESIZED:
                    if (config.propertiesId) {
                        this.properties.save(config.propertiesId, window);
                    }
                    break;

                case WindowEvent.SET_ON_TOP:
                    this.setWindowOnTop(window);
                    break;
            }
        });
        return window.content;
    }

    public get(value: WindowId): IWindowContent {
        let id = value.toString();
        if (value instanceof WindowConfig) {
            id = value.id;
        }
        if (!id) {
            return null;
        }
        let window = this.getById(id);
        if (_.isNil(window)) {
            return null;
        }
        return window.content;
    }

    public has(value: WindowId): boolean {
        return !_.isNil(this.get(value));
    }

    public setOnTop(value: WindowId): boolean {
        let content = this.get(value);
        if (!content) {
            return false;
        }
        content.window.setOnTop();
        return true;
    }

    public removeAll(): void {
        this.windowsArray.forEach(window => window.close());
    }

    public destroy(): void {
        this.removeAll();

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }

        if (this.properties) {
            this.properties.destroy();
            this.properties = null;
        }

        this.factory = null;
        this.properties = null;
        this.questionComponent = null;

        this.dialog = null;
        this.language = null;

        this._windows = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Additional Methods
    //
    // --------------------------------------------------------------------------

    public info(translationId?: string, translation?: any, questionOptions?: IQuestionOptions, configOptions?: WindowConfigOptions): IQuestion {
        let text = this.language.translate(translationId, translation);
        let config: WindowConfig<QuestionManager> = _.assign(new WindowConfig(true, false, 450), configOptions);
        config.data = new QuestionManager(_.assign(questionOptions, { mode: QuestionMode.INFO, text }));
        return this.open(this.questionComponent, config).config.data;
    }

    public question(translationId?: string, translation?: any, questionOptions?: IQuestionOptions, configOptions?: WindowConfigOptions): IQuestion {
        let text = this.language.translate(translationId, translation);
        let config: WindowConfig<QuestionManager> = _.assign(new WindowConfig(true, false, 450), configOptions);
        config.data = new QuestionManager(_.assign(questionOptions, { mode: QuestionMode.QUESTION, text }));
        return this.open(this.questionComponent, config).config.data;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    private get windowsArray(): Array<IWindow> {
        return Array.from(this.windows.values()).map(item => item.window);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<WindowServiceEvent, IWindow>> {
        return this.observer.asObservable();
    }

    public get windows(): Map<WindowConfig, IWindowContent> {
        return this._windows;
    }
}

export class PropertiesManager extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private cookies: CookieService) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public load(name: string, config: WindowConfig): void {
        let item = this.cookies.getObject(name + 'Window') as any;
        if (!item) {
            return;
        }
        if (item.hasOwnProperty('width')) {
            config.defaultWidth = item.width;
        }
        if (item.hasOwnProperty('height')) {
            config.defaultHeight = item.height;
        }
    }

    public save(name: string, window: IWindow): void {
        this.cookies.putObject(name + 'Window', {
            width: window.getWidth(),
            height: window.getHeight()
        });
    }

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }
        this.cookies = null;
    }
}

export type WindowId = string | WindowConfig;

export enum WindowServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    SETTED_ON_TOP = 'SETTED_ON_TOP'
}
