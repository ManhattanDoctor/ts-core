import { ComponentType } from '@angular/cdk/portal';
import { Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie';
import { Observable, Subject, Subscription } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { Destroyable } from '../../Destroyable';
import { ArrayUtil } from '../../util';
import { LanguageService } from '../language';
import { Question, QuestionMode } from '../Question';
import { ViewUtil } from '../util';
import { IWindow } from './IWindow';
import { IWindowContent } from './IWindowContent';
import { WindowAlign, WindowConfig } from './WindowConfig';
import { WindowFactory } from './WindowFactory';
import { WindowProperties } from './WindowProperties';

@Injectable()
export class WindowService extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public static GAP_X = 25;
    public static GAP_Y = 25;
    private static TOP_Z_INDEX = 999;

    public static DEFAULT_MIN_WIDTH = 100;
    public static DEFAULT_MIN_HEIGHT = 100;

    public static DEFAULT_PADDING_TOP = 25;
    public static DEFAULT_PADDING_LEFT = 25;
    public static DEFAULT_PADDING_RIGHT = 25;
    public static DEFAULT_PADDING_BOTTOM = 25;

    public static DEFAULT_VERTICAL_ALIGN: WindowAlign = WindowAlign.CENTER;
    public static DEFAULT_HORIZONTAL_ALIGN: WindowAlign = WindowAlign.CENTER;

    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public factory: WindowFactory<IWindow>;
    public questionWindow: ComponentType<IWindowContent>;

    public isNeedCheckWindowPositionAfterOpen: boolean = true;

    private _windows: Map<WindowConfig, IWindowContent>;
    private _windowsArray: Array<IWindow>;

    private observer: Subject<ObservableData<WindowServiceEvent, IWindow>>;
    private properties: PropertiesManager;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    // constructor(private dialog: MatDialog, private language: LanguageService, private cookies: CookieService) {
    constructor(private dialog: MatDialog, private language: LanguageService, private cookies: CookieService) {
        super();
        this._windows = new Map();
        this._windowsArray = [];

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
        let firstIndex: number = first.container ? parseInt(ViewUtil.getStyle(first.container.parentElement, 'zIndex'), 10) : -1;
        let secondIndex: number = second.container ? parseInt(ViewUtil.getStyle(second.container.parentElement, 'zIndex'), 10) : -1;

        return firstIndex > secondIndex ? -1 : 1;
    }

    private setWindowOnTop(topWindow: IWindow): void {
        let currentIndex = WindowService.TOP_Z_INDEX - 2;
        for (let window of this._windowsArray) {
            if (window.container) {
                window.isOnTop = window === topWindow;

                let zIndex = window.isOnTop ? WindowService.TOP_Z_INDEX : currentIndex--;
                ViewUtil.setStyle(window.backdrop, 'zIndex', zIndex);
                ViewUtil.setStyle(window.wrapper, 'zIndex', zIndex);
            }
        }

        this._windowsArray.sort(this.sortFunction);
        this.observer.next(new ObservableData(WindowServiceEvent.SETTED_ON_TOP, topWindow));
    }

    private updateTopWindow(): void {
        let zIndex = 0;
        let topWindow: IWindow = null;

        this._windowsArray.forEach(window => {
            if (window.container) {
                let wrapper: HTMLElement = window.container.parentElement;

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

    private checkWindowPosition(window: IWindow): void {
        while (this.hasWindowWithSamePosition(window)) {
            window.setX(window.getX() + WindowService.GAP_X);
            window.setY(window.getY() + WindowService.GAP_Y);
        }
    }

    private hasWindowWithSamePosition(itemWindow: IWindow): boolean {
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

    // --------------------------------------------------------------------------
    //
    // 	Setters Methods
    //
    // --------------------------------------------------------------------------

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

    private get(id: string): IWindow {
        let result: IWindow = null;
        this._windowsArray.forEach(window => {
            if (window.config.id === id) {
                result = window;
                return true;
            }
        });
        return result;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public openWindow(component: ComponentType<IWindowContent>, config: WindowConfig): IWindowContent {
        let window: IWindow = null;
        if (config.id) {
            window = this.get(config.id);
            if (window) {
                return window.content;
            }
        }

        if (!config.defaultMinWidth) {
            config.defaultMinWidth = WindowService.DEFAULT_MIN_WIDTH;
        }
        if (!config.defaultMinHeight) {
            config.defaultMinHeight = WindowService.DEFAULT_MIN_HEIGHT;
        }

        if (!config.verticalAlign) {
            config.verticalAlign = WindowService.DEFAULT_VERTICAL_ALIGN;
        }
        if (!config.horizontalAlign) {
            config.horizontalAlign = WindowService.DEFAULT_HORIZONTAL_ALIGN;
        }

        if (isNaN(config.paddingTop)) {
            config.paddingTop = WindowService.DEFAULT_PADDING_TOP;
        }
        if (isNaN(config.paddingLeft)) {
            config.paddingLeft = WindowService.DEFAULT_PADDING_LEFT;
        }
        if (isNaN(config.paddingRight)) {
            config.paddingRight = WindowService.DEFAULT_PADDING_RIGHT;
        }
        if (isNaN(config.paddingBottom)) {
            config.paddingBottom = WindowService.DEFAULT_PADDING_BOTTOM;
        }

        if (config.propertiesId) {
            this.properties.load(config.propertiesId, config);
        }

        config.setDefaultProperties();

        let dialog = this.dialog as any;
        // dialog._getOverlayState = config.isModal ? dialog.getOverlayStateModal : dialog.getOverlayStateNonModal;

        let reference: MatDialogRef<IWindowContent>; // = this.dialog.open(component, config);
        let properties: WindowProperties = {} as WindowProperties;
        properties.config = config;
        properties.reference = reference;
        properties.overlay = (reference as any)._overlayRef;

        window = this.factory.create(properties);

        let subscription: Subscription = window.events.subscribe(event => {
            switch (event) {
                case IWindow.EVENT_OPENED:
                    this.add(config, reference.componentInstance);

                    this.setWindowOnTop(window);
                    if (this.isNeedCheckWindowPositionAfterOpen) {
                        this.checkWindowPosition(window);
                    }
                    break;

                case IWindow.EVENT_CLOSED:
                    subscription.unsubscribe();
                    this.remove(config, window);

                    if (window.isOnTop && this.windows.size > 0) {
                        this.updateTopWindow();
                    }
                    break;

                case IWindow.EVENT_RESIZED:
                    if (config.propertiesId) {
                        this.properties.save(config.propertiesId, window);
                    }
                    break;

                case IWindow.EVENT_SET_ON_TOP:
                    this.setWindowOnTop(window);
                    break;
            }
        });

        return window.content;
    }

    public getWindow(value: WindowConfig | string): IWindowContent {
        let id: string = value.toString();
        if (value instanceof WindowConfig) {
            id = value.id;
        }

        if (!id) {
            return null;
        }

        let window = this.get(id);
        return window ? window.content : null;
    }

    public hasWindow(value: WindowConfig | string): boolean {
        return this.getWindow(value) != null;
    }

    public removeAll(): void {
        this._windowsArray.forEach(window => window.close());
    }

    public destroy(): void {
        this.removeAll();
        this.factory = null;
        this.observer = null;
        this.properties = null;
        this.questionWindow = null;

        this._windows = null;
        this._windowsArray = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Additional Methods
    //
    // --------------------------------------------------------------------------

    public setWindowOnTopIfExist(value: WindowConfig | string): boolean {
        let content = this.getWindow(value);
        if (!content) {
            return false;
        }
        content.window.setOnTop();
        return true;
    }

    public info(translationId?: string, translation?: any): Question {
        let config = this.factory.createConfig(true, false, 450);
        let content: any = this.openWindow(this.questionWindow, config);

        let question = content as Question;
        question.text = this.language.translate(translationId, translation);
        question.mode = QuestionMode.INFO;
        return question;
    }

    public question(translationId?: string, translation?: any): Question {
        let config = this.factory.createConfig(true, false, 450);
        let content: any = this.openWindow(this.questionWindow, config);

        config.disableClose = true;

        let question = content as Question;
        question.text = this.language.translate(translationId, translation);
        question.mode = QuestionMode.QUESTION;
        return question;
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

export class PropertiesManager {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private cookies: CookieService) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public load(name: string, config: WindowConfig): void {
        let properties = this.cookies.getObject(name + 'Window') as any;
        if (!properties) {
            return;
        }
        if (properties.hasOwnProperty('width')) {
            config.defaultWidth = properties.width;
        }
        if (properties.hasOwnProperty('height')) {
            config.defaultHeight = properties.height;
        }
    }

    public save(name: string, window: IWindow): void {
        let properties = {} as any;
        properties.width = window.getWidth();
        properties.height = window.getHeight();
        this.cookies.putObject(name + 'Window', properties);
    }
}

export enum WindowServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    SETTED_ON_TOP = 'SETTED_ON_TOP'
}
