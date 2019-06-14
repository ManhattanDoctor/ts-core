import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { ArrayUtil } from '../../../common/util';
import { Destroyable } from '../../Destroyable';
import { CookieService } from '../cookie';
import { LanguageService } from '../language';
import { IQuestion, QuestionMode, QuestionOptions } from '../question';
import { ViewUtil } from '../util';
import { IWindow, WindowEvent } from './IWindow';
import { IWindowContent } from './IWindowContent';
import { WindowAlign, WindowConfig } from './WindowConfig';
import { WindowFactory } from './WindowFactory';

@Injectable()
export class WindowService extends Destroyable {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public factory: WindowFactory<IWindow>;
    public questionComponent: ComponentType<IWindowContent>;
    public isNeedCheckPositionAfterOpen: boolean = true;

    protected dialog: MatDialog;
    protected language: LanguageService;

    private _windows: Map<WindowConfig, IWindowContent>;
    private _windowsArray: Array<IWindow>;

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

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(dialog: MatDialog, language: LanguageService, cookies: CookieService) {
        super();
        this._windows = new Map();
        this._windowsArray = [];

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

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    private sortFunction(first: IWindow, second: IWindow): number {
        let firstIndex = first.container ? parseInt(ViewUtil.getStyle(first.container.parentElement, 'zIndex'), 10) : -1;
        let secondIndex = second.container ? parseInt(ViewUtil.getStyle(second.container.parentElement, 'zIndex'), 10) : -1;
        return firstIndex > secondIndex ? -1 : 1;
    }

    private updateTop(): void {
        let zIndex = 0;
        let topWindow: IWindow = null;

        this._windowsArray.forEach(window => {
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
        for (let window of this._windowsArray) {
            if (window.container) {
                window.isOnTop = window === topWindow;
                let zIndex = window.isOnTop ? this.topZIndex : currentIndex--;
                ViewUtil.setStyle(window.backdrop, 'zIndex', zIndex);
                ViewUtil.setStyle(window.wrapper, 'zIndex', zIndex);
            }
        }

        this._windowsArray.sort(this.sortFunction);
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
        this._windowsArray.forEach(window => {
            if (window !== itemWindow && x === window.getX() && y === window.getY()) {
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

    private add(config: WindowConfig, content: IWindowContent): void {
        this._windows.set(config, content);
        this._windowsArray.push(content.window);
        this.observer.next(new ObservableData(WindowServiceEvent.OPENED, content.window));
    }

    private remove(config: WindowConfig, window: IWindow): void {
        this._windows.delete(config);
        ArrayUtil.remove(this._windowsArray, window);
        this.observer.next(new ObservableData(WindowServiceEvent.CLOSED, window));
    }

    private getById(id: string): IWindow {
        let result = null;
        this._windowsArray.forEach(item => {
            if (item.config.id === id) {
                result = item;
                return true;
            }
        });
        return result;
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

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

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
                    this.remove(config, window);

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

    public get<T extends IWindowContent>(value: WindowConfig | string): T {
        let id = value.toString();
        if (value instanceof WindowConfig) {
            id = value.id;
        }

        if (!id) {
            return null;
        }

        let window = this.getById(id);
        return window ? (window.content as any) : null;
    }

    public has(value: WindowConfig | string): boolean {
        return !_.isNil(this.get(value));
    }

    public setOnTop(value: WindowConfig | string): boolean {
        let content = this.get(value);
        if (!content) {
            return false;
        }
        content.window.setOnTop();
        return true;
    }

    public removeAll(): void {
        this._windowsArray.forEach(window => window.close());
    }

    public destroy(): void {
        this.removeAll();

        if (this.properties) {
            this.properties.destroy();
            this.properties = null;
        }

        this.factory = null;
        this.observer = null;
        this.properties = null;
        this.questionComponent = null;

        this.dialog = null;
        this.language = null;

        this._windows = null;
        this._windowsArray = null;
    }

    //--------------------------------------------------------------------------
    //
    // 	Additional Methods
    //
    //--------------------------------------------------------------------------

    public info(translationId?: string, translation?: any, options?: QuestionOptions): IQuestion {
        let config = this.factory.createConfig(true, false, 450);

        let content: IQuestion = this.open(this.questionComponent, config) as any;
        content.initialize(_.assign(options, { mode: QuestionMode.INFO, text: this.language.translate(translationId, translation) }));
        return content;
    }

    public question(translationId?: string, translation?: any, options?: QuestionOptions): IQuestion {
        let config = this.factory.createConfig(true, false, 450);
        config.disableClose = true;

        let content: IQuestion = this.open(this.questionComponent, config) as any;
        content.initialize(_.assign(options, { mode: QuestionMode.QUESTION, text: this.language.translate(translationId, translation) }));
        return content;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get events(): Observable<ObservableData<WindowServiceEvent, IWindow>> {
        return this.observer.asObservable();
    }

    public get windows(): Map<WindowConfig, IWindowContent> {
        return this._windows;
    }
}

export class PropertiesManager extends Destroyable {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private cookies: CookieService) {
        super();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

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
        this.cookies = null;
    }
}

export enum WindowServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    SETTED_ON_TOP = 'SETTED_ON_TOP'
}
