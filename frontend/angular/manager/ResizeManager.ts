import { ResizeSensor } from 'css-element-queries';
import { IDestroyable } from '@ts-core/common';

export class ResizeManager implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected timer: any;
    protected sensor: ResizeSensor;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private element: HTMLElement, private handler: () => void, private delay: number = 0, private isForceResize: boolean = false) {
        this.timer = setTimeout(this.initialize);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private initialize = (): void => {
        this.sensor = new ResizeSensor(this.element, this.resizeHandler);
        if (this.isForceResize) {
            this.resizeHandler();
        }
    };

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected callHandler = (): void => {
        this.handler();
    };

    protected resizeHandler = () => {
        if (isNaN(this.delay) || this.delay <= 0) {
            this.callHandler();
            return;
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(this.callHandler, this.delay);
    };

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.sensor) {
            this.sensor.detach(this.resizeHandler);
            this.sensor = null;
        }
        this.handler = null;
        this.element = null;
    }
}
