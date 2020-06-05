import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/internal/operators';
import { ViewUtil } from '../util/ViewUtil';
import { IWindow, WindowEvent } from './IWindow';
import { IWindowContent } from './IWindowContent';
import { WindowBase } from './WindowBase';
import { WindowConfig } from './WindowConfig';
import { WindowProperties } from './WindowProperties';

export class WindowImpl extends WindowBase implements IWindow {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static BLINK_DELAY = 500;
    public static SHAKE_DELAY = 500;
    public static RESIZE_DELAY = 200;

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _isBlink: boolean = false;
    private blinkTimer: any;

    private _isShaking: boolean = false;
    private shakeTimer: any;

    private resizeTimer: any;

    private _isOnTop: boolean = false;
    private _isDisabled: boolean = false;
    private _isMinimized: boolean = false;

    private isOpened: boolean = false;
    private isWasOnTop: boolean = false;

    private _wrapper: HTMLElement;
    private _backdrop: HTMLElement;
    private _container: HTMLElement;

    protected properties: WindowProperties;

    protected subscription: Subscription;
    protected observer: Subject<string>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(properties: WindowProperties) {
        super();
        this.observer = new Subject();

        this.properties = properties;
        this.content.window = this;

        // Have to save for unsubscribe on destroy
        this._wrapper = this.properties.overlay.hostElement;
        this._backdrop = this.properties.overlay.backdropElement;
        this._container = this.properties.overlay.overlayElement;

        this.setProperties();
        this.setPosition();

        this.getReference()
            .afterOpen()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.setOpened);

        this.getReference()
            .afterClosed()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.setClosed);

        this.events
            .pipe(
                filter(event => event === WindowEvent.CONTENT_READY),
                takeUntil(this.destroyed)
            )
            .subscribe(this.checkSizeAndUpdatePositionIfNeed);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected setClosed = (): void => {
        this.isOpened = false;
        this.emit(WindowEvent.CLOSED);
        this.destroy();
    };

    protected setOpened = (): void => {
        this.isOpened = true;
        this.emit(WindowEvent.OPENED);
    };

    protected blinkToggle = (): void => {
        this.isBlink = !this.isBlink;
    };

    protected stopShaking = (): void => {
        this.isShaking = false;
    };

    protected emitResize = (): void => {
        this.emit(WindowEvent.RESIZED);
    };

    protected setProperties(): void {
        super.setProperties();
        ViewUtil.addClass(this.container, 'window');
        if (!this.config.isModal) {
            this.container.addEventListener('click', this.mouseClickHandlerProxy, true);
            this.container.addEventListener('mousedown', this.mouseDownHandlerProxy);
        }
    }

    protected commitIsBlinkProperties(): void {}
    protected commitIsShakingProperties(): void {}
    protected commitIsDisabledProperties(): void {}
    protected commitIsMinimizedProperties(): void {}

    protected getConfig(): WindowConfig {
        return this.properties.config;
    }
    protected getContainer(): HTMLElement {
        return this.container;
    }
    protected getReference(): MatDialogRef<IWindowContent> {
        return this.properties.reference;
    }

    protected isNeedClickStopPropagation(event: MouseEvent): boolean {
        return !this.isWasOnTop;
    }

    private stopBlinkIfNeed(): void {
        this.isBlink = false;
        if (!this.blinkTimer) {
            return;
        }
        clearInterval(this.blinkTimer);
        this.blinkTimer = null;
    }

    private resizeHandler = (): void => {
        if (!this.isOpened) {
            return;
        }
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(this.emitResize, WindowImpl.RESIZE_DELAY);
    };

    protected mouseDownHandler(event: MouseEvent): void {
        this.setOnTop();
    }

    protected mouseClickHandler(event: MouseEvent): void {
        if (this.isNeedClickStopPropagation(event)) {
            event.stopPropagation();
        }
        if (!this.isWasOnTop) {
            this.isWasOnTop = true;
        }
    }

    private mouseDownHandlerProxy = (event: MouseEvent): void => {
        this.mouseDownHandler(event);
    };

    private mouseClickHandlerProxy = (event: MouseEvent): void => {
        this.mouseClickHandler(event);
    };

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public emit(event: string): void {
        this.observer.next(event);
    }

    public close(): void {
        this.getReference().close();
    }

    public destroy(): void {
        super.destroy();

        this._container.removeEventListener('click', this.mouseClickHandlerProxy, true);
        this._container.removeEventListener('mousedown', this.mouseDownHandlerProxy);

        if (this.content) {
            this.content.destroy();
        }

        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }

        this.properties = null;

        this._wrapper = null;
        this._backdrop = null;
        this._container = null;

        clearInterval(this.blinkTimer);
        this.blinkTimer = null;

        clearInterval(this.shakeTimer);
        this.shakeTimer = null;

        clearTimeout(this.resizeTimer);
        this.resizeTimer = null;
    }

    public blink(): void {
        clearInterval(this.blinkTimer);
        this.blinkTimer = setInterval(this.blinkToggle, WindowImpl.BLINK_DELAY);
    }

    public shake(): void {
        if (this.isShaking) {
            return;
        }
        this.isShaking = true;
        clearInterval(this.shakeTimer);
        this.shakeTimer = setInterval(this.stopShaking, WindowImpl.SHAKE_DELAY);
    }

    public setOnTop = (): void => {
        this.isWasOnTop = this.isOnTop;
        this.emit(WindowEvent.SET_ON_TOP);
    };

    // --------------------------------------------------------------------------
    //
    //  Size Methods
    //
    // --------------------------------------------------------------------------

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public setWidth(value: number, isNeedNotify: boolean = true): void {
        this.width = value;
        if (isNeedNotify) {
            this.resizeHandler();
        }
    }

    public setHeight(value: number, isNeedNotify: boolean = true): void {
        this.height = value;
        if (isNeedNotify) {
            this.resizeHandler();
        }
    }

    public setSize(width: number, height: number): void {
        this.setWidth(width, false);
        this.setHeight(height, false);
        this.resizeHandler();
    }

    // --------------------------------------------------------------------------
    //
    //  Move Methods
    //
    // --------------------------------------------------------------------------

    public getX(): number {
        return this.x;
    }

    public setX(value: number, isNeedNotify: boolean = true): void {
        this.x = value;
        if (isNeedNotify) {
            this.emit(WindowEvent.MOVED);
        }
    }

    public getY(): number {
        return this.y;
    }
    public setY(value: number, isNeedNotify: boolean = true): void {
        this.y = value;
        if (isNeedNotify) {
            this.emit(WindowEvent.MOVED);
        }
    }

    public move(x: number, y: number): void {
        this.setX(x, false);
        this.setY(y, false);
        this.emit(WindowEvent.MOVED);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    protected get isBlink(): boolean {
        return this._isBlink;
    }
    protected set isBlink(value: boolean) {
        if (value === this._isBlink) {
            return;
        }
        this._isBlink = value;
        this.commitIsBlinkProperties();
    }

    protected get isShaking(): boolean {
        return this._isShaking;
    }
    protected set isShaking(value: boolean) {
        if (value === this._isShaking) {
            return;
        }
        this._isShaking = value;
        this.commitIsShakingProperties();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<string> {
        return this.observer.asObservable();
    }

    public get config(): WindowConfig {
        return this.properties.config;
    }

    public get content(): IWindowContent {
        return this.properties.reference ? this.properties.reference.componentInstance : null;
    }

    public get container(): HTMLElement {
        return this._container;
    }

    public get wrapper(): HTMLElement {
        return this._wrapper;
    }

    public get backdrop(): HTMLElement {
        return this._backdrop;
    }

    public get isOnTop(): boolean {
        return this._isOnTop;
    }
    public set isOnTop(value: boolean) {
        if (value === this._isOnTop) {
            return;
        }
        this._isOnTop = value;
        clearInterval(this.blinkTimer);
        this.isBlink = false;
    }

    public get isMinimized(): boolean {
        return this._isMinimized;
    }
    public set isMinimized(value: boolean) {
        if (value === this._isMinimized) {
            return;
        }
        this._isMinimized = value;
        this.commitIsMinimizedProperties();
        this.emit(WindowEvent.MINIMIZED_CHANGED);
        this.stopBlinkIfNeed();
    }

    public get isDisabled(): boolean {
        return this._isDisabled;
    }
    public set isDisabled(value: boolean) {
        if (value === this._isDisabled) {
            return;
        }
        this._isDisabled = value;
        this.commitIsDisabledProperties();
        this.emit(WindowEvent.DISABLED_CHANGED);
    }
}
