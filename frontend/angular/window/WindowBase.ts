import { MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { DestroyableContainer } from '../../DestroyableContainer';
import { ViewUtil } from '../util';
import { WindowAlign, WindowConfig } from './WindowConfig';

export abstract class WindowBase extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _x: number = NaN;
    protected _width: number = NaN;

    protected _y: number = NaN;
    protected _height: number = NaN;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected abstract getConfig(): WindowConfig;
    protected abstract getReference(): MatDialogRef<any>;
    protected abstract getContainer(): HTMLElement;

    protected setProperties(): void {
        let config = this.getConfig();
        if (!_.isNaN(config.defaultWidth)) {
            this.width = config.defaultWidth;
        }
        if (!_.isNaN(config.defaultHeight)) {
            this.height = config.defaultHeight;
        }
    }

    protected setPosition(): void {
        let width = null;
        let height = null;
        let config = this.getConfig();

        switch (config.horizontalAlign) {
            case WindowAlign.START:
                this.x = !_.isNaN(this.paddingLeft) ? this.paddingLeft : 0;
                break;
            case WindowAlign.END:
                width = !_.isNaN(this.width) ? this.width : ViewUtil.getWidth(this.getContainer());
                let value = ViewUtil.stageWidth - width;
                if (!_.isNaN(this.paddingRight)) {
                    value -= this.paddingRight;
                }
                this.x = value;
                break;
            default:
                width = !_.isNaN(this.width) ? this.width : ViewUtil.getWidth(this.getContainer());
                this.x = (ViewUtil.stageWidth - width) / 2;
                break;
        }

        switch (config.verticalAlign) {
            case WindowAlign.START:
                this.y = !_.isNaN(this.paddingTop) ? this.paddingTop : 0;
                break;
            case WindowAlign.END:
                height = !_.isNaN(this.height) ? this.height : ViewUtil.getHeight(this.getContainer());
                let value = ViewUtil.stageHeight - height;
                if (!_.isNaN(this.paddingBottom)) {
                    value -= this.paddingBottom;
                }
                this.y = value;
                break;
            default:
                height = !_.isNaN(this.height) ? this.height : ViewUtil.getHeight(this.getContainer());
                this.y = (ViewUtil.stageHeight - height) / 2;
                break;
        }
    }

    protected clearSize(): void {
        this._x = NaN;
        this._y = NaN;
        this._width = NaN;
        this._height = NaN;
    }

    protected commitSizeProperties(): void {
        let width = !_.isNaN(this._width) ? this._width + 'px' : 'auto';
        let height = !_.isNaN(this._height) ? this._height + 'px' : 'auto';
        this.getReference().updateSize(width, height);
    }

    protected commitPositionProperties(): void {
        if (_.isNaN(this._x) && _.isNaN(this._y)) {
            return;
        }
        let position = {} as any;
        if (!_.isNaN(this._y)) {
            position.top = this._y + 'px';
        }
        if (!_.isNaN(this._x)) {
            position.left = this._x + 'px';
        }
        this.getReference().updatePosition(position);
    }

    protected checkSizeAndUpdatePositionIfNeed = (): void => {
        if (_.isNaN(this.height) || _.isNaN(this.width)) {
            this.setPosition();
        }
    };

    // --------------------------------------------------------------------------
    //
    // 	Position Methods
    //
    // --------------------------------------------------------------------------

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        value = this.getConfig().parseX(value);
        if (value === this._x) {
            return;
        }
        this._x = value;
        this.commitPositionProperties();
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        value = this.getConfig().parseY(value);
        if (value === this._y) {
            return;
        }
        this._y = value;
        this.commitPositionProperties();
    }

    public get paddingTop(): number {
        return this.getConfig().paddingTop;
    }

    public get paddingLeft(): number {
        return this.getConfig().paddingLeft;
    }

    public get paddingRight(): number {
        return this.getConfig().paddingRight;
    }

    public get paddingBottom(): number {
        return this.getConfig().paddingBottom;
    }

    protected get width(): number {
        return this._width;
    }
    protected set width(value: number) {
        value = this.getConfig().parseWidth(value);
        if (value === this._width) {
            return;
        }
        this._width = value;
        this.commitSizeProperties();
    }

    protected get height(): number {
        return this._height;
    }
    protected set height(value: number) {
        value = this.getConfig().parseHeight(value);
        if (value === this._height) {
            return;
        }
        this._height = value;
        this.commitSizeProperties();
    }
}
