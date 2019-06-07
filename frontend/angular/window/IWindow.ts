import { Observable } from 'rxjs';
import { Destroyable } from '../../Destroyable';
import { IWindowContent } from './IWindowContent';
import { WindowConfig } from './WindowConfig';

export abstract class IWindow extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static EVENT_OPENED = 'OPENED';
    public static EVENT_CLOSED = 'CLOSED';
    public static EVENT_CONTENT_READY = 'EVENT_CONTENT_READY';

    public static EVENT_MOVED = 'EVENT_MOVED';
    public static EVENT_RESIZED = 'EVENT_RESIZED';
    public static EVENT_MINIMIZED_CHANGED = 'EVENT_MINIMIZED_CHANGED';

    public static EVENT_SET_ON_TOP = 'EVENT_SET_ON_TOP';

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

    readonly config: WindowConfig;
    readonly content: IWindowContent;
}
