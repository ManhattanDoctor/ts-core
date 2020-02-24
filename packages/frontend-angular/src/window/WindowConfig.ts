import { MatDialogConfig } from '@angular/material/dialog';
import * as _ from 'lodash';
import { IDestroyable } from '@ts-core/common';
import { ViewUtil } from '../util/ViewUtil';

export class WindowConfig<T = any> extends MatDialogConfig<T> implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public id: string;
    public isResizeable: boolean = false;
    public isMinimizable: boolean = false;
    public isContentDragable: boolean = true;

    public propertiesId: string;

    public x: number = NaN;
    public y: number = NaN;

    public defaultWidth: number = NaN;
    public defaultMinWidth: number = NaN;
    public defaultMaxWidth: number = NaN;

    public defaultHeight: number = NaN;
    public defaultMinHeight: number = NaN;
    public defaultMaxHeight: number = NaN;

    public paddingTop: number = NaN;
    public paddingLeft: number = NaN;
    public paddingRight: number = NaN;
    public paddingBottom: number = NaN;

    public verticalAlign: WindowAlign;
    public horizontalAlign: WindowAlign;

    protected _isModal: boolean = false;

    protected _elementMaxX: number = NaN;
    protected _elementMinX: number = NaN;

    protected _elementMaxY: number = NaN;
    protected _elementMinY: number = NaN;

    protected _elementWidth: string;
    protected _elementMinWidth: number = NaN;
    protected _elementMaxWidth: number = NaN;

    protected _elementHeight: string;
    protected _elementMinHeight: number = NaN;
    protected _elementMaxHeight: number = NaN;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(isModal: boolean = false, isResizeable: boolean = false, width: number = NaN, height: number = NaN) {
        super();

        this.isModal = this.hasBackdrop = isModal;
        this.isResizeable = isResizeable;

        if (!_.isNaN(width)) {
            this.defaultWidth = width;
        }

        if (!_.isNaN(height)) {
            this.defaultHeight = height;
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public setDefaultProperties(): void {
        this.width = this.elementWidth;
        this.maxWidth = this.elementMaxWidth;
        this.minWidth = this.elementMinWidth;

        this.height = this.elementHeight;
        this.maxHeight = this.elementMaxHeight;
        this.minHeight = this.elementMinHeight;
    }

    public parseX(value: number): number {
        value = Math.max(value, this.elementMinX);
        value = Math.min(value, this.elementMaxX);
        return value;
    }

    public parseY(value: number): number {
        value = Math.max(value, this.elementMinY);
        value = Math.min(value, this.elementMaxY);
        return value;
    }

    public parseWidth(value: number): number {
        value = Math.max(value, this.elementMinWidth);
        value = Math.min(value, this.elementMaxWidth);
        return value;
    }

    public parseHeight(value: number): number {
        value = Math.max(value, this.elementMinHeight);
        value = Math.min(value, this.elementMaxHeight);
        return value;
    }

    public destroy(): void {
        IDestroyable.destroy(this.data);
        this.data = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isModal(): boolean {
        return this._isModal;
    }
    public set isModal(value: boolean) {
        if (value === this._isModal) {
            return;
        }
        this._isModal = value;
        this.hasBackdrop = value;
    }

    public get elementMinY(): number {
        if (!_.isNaN(this._elementMinY)) {
            return this._elementMinY;
        }
        this._elementMinY = 0 - ViewUtil.getStageHeight();
        if (!_.isNaN(this.paddingTop)) {
            this._elementMinY += this.paddingTop;
        }
        return this._elementMinY;
    }
    public get elementMaxY(): number {
        if (!_.isNaN(this._elementMaxY)) {
            return this._elementMaxY;
        }
        this._elementMaxY = ViewUtil.getStageHeight();
        if (!_.isNaN(this.paddingBottom)) {
            this._elementMaxY -= this.paddingBottom;
        }
        return this._elementMaxY;
    }

    public get elementMinX(): number {
        if (!_.isNaN(this._elementMinX)) {
            return this._elementMinX;
        }
        this._elementMinX = -ViewUtil.getStageWidth();
        if (!_.isNaN(this.paddingLeft)) {
            this._elementMinX += this.paddingLeft;
        }
        return this._elementMinX;
    }
    public get elementMaxX(): number {
        if (!_.isNaN(this._elementMaxX)) {
            return this._elementMaxX;
        }
        this._elementMaxX = ViewUtil.getStageWidth();
        if (!_.isNaN(this.paddingRight)) {
            this._elementMaxX -= this.paddingRight;
        }
        return this._elementMaxX;
    }

    public get elementWidth(): string {
        if (this._elementWidth) {
            return this._elementWidth;
        }
        this._elementWidth = 'auto';
        if (this.defaultWidth) {
            this._elementWidth = this.defaultWidth + 'px';
        }
        return this._elementWidth;
    }
    public get elementMinWidth(): number {
        if (!_.isNaN(this._elementMinWidth)) {
            return this._elementMinWidth;
        }
        this._elementMinWidth = 0;
        if (!_.isNaN(this.defaultMinWidth)) {
            let value = ViewUtil.getStageWidth();
            if (!_.isNaN(this.paddingLeft)) {
                value -= this.paddingLeft;
            }
            if (!_.isNaN(this.paddingRight)) {
                value -= this.paddingRight;
            }
            this._elementMinWidth = Math.min(this.defaultMinWidth, value);
        }
        return this._elementMinWidth;
    }
    public get elementMaxWidth(): number {
        if (!_.isNaN(this._elementMaxWidth)) {
            return this._elementMaxWidth;
        }
        this._elementMaxWidth = ViewUtil.getStageWidth();
        if (!_.isNaN(this.paddingLeft)) {
            this._elementMaxWidth -= this.paddingLeft;
        }
        if (!_.isNaN(this.paddingRight)) {
            this._elementMaxWidth -= this.paddingRight;
        }
        if (!_.isNaN(this.defaultMaxWidth)) {
            this._elementMaxWidth = Math.min(this.defaultMaxWidth, this._elementMaxWidth);
        }
        return this._elementMaxWidth;
    }

    public get elementHeight(): string {
        if (this._elementHeight) {
            return this._elementHeight;
        }
        this._elementHeight = 'auto';
        if (this.defaultHeight) {
            this._elementHeight = this.defaultHeight + 'px';
        }
        return this._elementHeight;
    }
    public get elementMinHeight(): number {
        if (!_.isNaN(this._elementMinHeight)) {
            return this._elementMinHeight;
        }
        this._elementMinHeight = 0;
        if (!_.isNaN(this.defaultMinHeight)) {
            let value = ViewUtil.getStageHeight();
            if (!_.isNaN(this.paddingTop)) {
                value -= this.paddingTop;
            }
            if (!_.isNaN(this.paddingBottom)) {
                value -= this.paddingBottom;
            }
            this._elementMinHeight = Math.min(this.defaultMinHeight, value);
        }
        return this._elementMinHeight;
    }

    public get elementMaxHeight(): number {
        if (!_.isNaN(this._elementMaxHeight)) {
            return this._elementMaxHeight;
        }
        this._elementMaxHeight = ViewUtil.getStageHeight();
        if (!_.isNaN(this.paddingTop)) {
            this._elementMaxHeight -= this.paddingTop;
        }
        if (!_.isNaN(this.paddingBottom)) {
            this._elementMaxHeight -= this.paddingBottom;
        }
        if (!_.isNaN(this.defaultMaxHeight)) {
            this._elementMaxHeight = Math.min(this.defaultMaxHeight, this._elementMaxHeight);
        }
        return this._elementMaxHeight;
    }
}

export enum WindowAlign {
    START = 'START',
    CENTER = 'CENTER',
    END = 'END'
}

export type WindowConfigOptions<T = any> = { [P in keyof WindowConfig<T>]?: any };
