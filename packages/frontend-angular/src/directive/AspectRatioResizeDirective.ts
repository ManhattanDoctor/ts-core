import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import * as _ from 'lodash';
import { ResizeManager } from '../manager/ResizeManager';
import { ViewUtil } from '../util/ViewUtil';

@Directive({
    selector: '[vi-aspect-ratio]'
})
export class AspectRatioResizeDirective extends DestroyableContainer implements AfterViewInit {
    // --------------------------------------------------------------------------
    //
    //	Static Properties
    //
    // --------------------------------------------------------------------------

    protected static UPDATE_DELAY: number = 100;

    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private _ratio: number = NaN;
    private _direction: Direction;

    private sensor: ResizeManager;
    private element: HTMLElement;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef) {
        super();
        this.element = ViewUtil.parseElement(element.nativeElement);
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private commitResizeProperties = (): void => {
        switch (this.direction) {
            case Direction.HORIZONTAL:
                this.width = this.height / this.ratio;
                break;
            case Direction.VERTICAL:
                this.height = this.width * this.ratio;
                break;
        }
    };

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public ngAfterViewInit(): void {
        this.sensor = new ResizeManager(this.element, this.commitResizeProperties, AspectRatioResizeDirective.UPDATE_DELAY);

        if (_.isNaN(this.ratio)) {
            this.ratio = 4 / 3;
        }
    }

    public ngOnDestroy(): void {
        this.destroy();
    }

    public destroy(): void {
        this.element = null;

        if (this.sensor) {
            this.sensor.destroy();
            this.sensor = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Private Properties
    //
    // --------------------------------------------------------------------------

    private get width(): number {
        return ViewUtil.getWidth(this.element);
    }

    private set width(value: number) {
        ViewUtil.setWidth(this.element, value, true);
    }

    private get height(): number {
        return ViewUtil.getHeight(this.element);
    }

    private set height(value: number) {
        ViewUtil.setHeight(this.element, value, true);
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    @Input('vi-aspect-ratio')
    public set direction(value: Direction) {
        if (value === this._direction || _.isNil(value)) {
            return;
        }
        this._direction = value;
        this.commitResizeProperties();
    }
    public get direction(): Direction {
        return this._direction;
    }

    @Input()
    public set ratio(value: number) {
        if (value === this._ratio) {
            return;
        }
        this._ratio = value;
        this.commitResizeProperties();
    }
    public get ratio(): number {
        return this._ratio;
    }
}

export enum Direction {
    VERTICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL'
}
