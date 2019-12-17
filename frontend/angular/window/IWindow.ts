import { Observable } from 'rxjs';
import { Destroyable } from '@ts-core/common/Destroyable';
import { IWindowContent } from './IWindowContent';
import { WindowConfig } from './WindowConfig';

export abstract class IWindow<T = any> extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    abstract close(): void;
    abstract destroy(): void;

    abstract blink(): void;
    abstract shake(): void;
    abstract setOnTop(): void;

    abstract getWidth(): number;
    abstract getHeight(): number;
    abstract setWidth(value: number): void;
    abstract setHeight(value: number): void;
    abstract setSize(width: number, height: number): void;

    abstract getX(): number;
    abstract getY(): number;
    abstract setX(value: number): void;
    abstract setY(value: number): void;
    abstract move(x: number, y: number): void;

    abstract emit(event: string): void;

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public isOnTop: boolean = false;
    public isMinimized: boolean = false;

    readonly events: Observable<string>;
    readonly container: HTMLElement;
    readonly wrapper: HTMLElement;
    readonly backdrop: HTMLElement;

    readonly config: WindowConfig<T>;
    readonly content: IWindowContent<T>;
}

export enum WindowEvent {
    OPENED = 'OPENED',
    CLOSED = 'CLOSED',
    CONTENT_READY = 'CONTENT_READY',

    MOVED = 'EVENT_MOVED',
    RESIZED = 'RESIZED',
    MINIMIZED_CHANGED = 'MINIMIZED_CHANGED',

    SET_ON_TOP = 'SET_ON_TOP'
}
