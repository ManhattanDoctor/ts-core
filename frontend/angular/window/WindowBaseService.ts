import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie';
import { Observable, Subject } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { Destroyable } from '../../Destroyable';
import { ArrayUtil } from '../../util';
import { IQuestion, QuestionMode } from '../IQuestion';
import { LanguageService } from '../language';
import { ViewUtil } from '../util';
import { IWindow, WindowEvent } from './IWindow';
import { IWindowContent } from './IWindowContent';
import { WindowAlign, WindowConfig } from './WindowConfig';
import { WindowFactory } from './WindowFactory';
import { WindowProperties } from './WindowProperties';

export class WindowBaseService extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public factory: WindowFactory<IWindow>;
    public questionWindow: ComponentType<IWindowContent>;
    public isNeedCheckWindowPositionAfterOpen: boolean = true;

    protected dialog: MatDialog;
    protected language: LanguageService;

    private _windows: Map<WindowConfig, IWindowContent>;
    private _windowsArray: Array<IWindow>;

    private observer: Subject<ObservableData<WindowServiceEvent, IWindow>>;
    private properties: PropertiesManager;

    protected gapX: number;
    protected gapY: number;

    protected topZIndex: number;
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

    constructor(dialog: MatDialog, language: LanguageService, cookies: CookieService) {
        super();
        this._windows = new Map();
        this._windowsArray = [];

        this.dialog = dialog;
        this.language = language;
        this.observer = new Subject();
        this.properties = new PropertiesManager(cookies);

        this.topZIndex = 999;
        this.gapX = this.gapY = 25;
        this.minWidth = this.minHeight = 100;
        this.paddingTop = this.paddingLeft = this.paddingBottom = this.paddingRight = 25;

        this.verticalAlign = WindowAlign.CENTER;
        this.horizontalAlign = WindowAlign.CENTER;
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
            window.setX(window.getX() + this.gapX);
            window.setY(window.getY() + this.gapY);
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
        let result = null;
        this._windowsArray.forEach(item => {
            if (item.config.id === id) {
                result = item;
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

        let subscription = window.events.subscribe(event => {
            switch (event) {
                case WindowEvent.OPENED:
                    this.add(config, reference.componentInstance);
                    this.setWindowOnTop(window);
                    if (this.isNeedCheckWindowPositionAfterOpen) {
                        this.checkWindowPosition(window);
                    }
                    break;

                case WindowEvent.CLOSED:
                    subscription.unsubscribe();
                    this.remove(config, window);

                    if (window.isOnTop && this.windows.size > 0) {
                        this.updateTopWindow();
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

        if (this.properties) {
            this.properties.destroy();
            this.properties = null;
        }

        this.factory = null;
        this.observer = null;
        this.properties = null;
        this.questionWindow = null;

        this.dialog = null;
        this.language = null;

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

    public info(translationId?: string, translation?: any): IQuestion {
        let config = this.factory.createConfig(true, false, 450);
        let content: any = this.openWindow(this.questionWindow, config);

        let question = content as IQuestion;
        question.text = this.language.translate(translationId, translation);
        question.mode = QuestionMode.INFO;
        return question;
    }

    public question(translationId?: string, translation?: any): IQuestion {
        let config = this.factory.createConfig(true, false, 450);
        let content: any = this.openWindow(this.questionWindow, config);

        config.disableClose = true;

        let question = content as IQuestion;
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
        this.cookies = null;
    }
}

export enum WindowServiceEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    SETTED_ON_TOP = 'SETTED_ON_TOP'
}
