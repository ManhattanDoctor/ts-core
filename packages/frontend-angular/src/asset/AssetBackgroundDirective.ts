import { Directive, ElementRef, Input } from '@angular/core';
import { Destroyable } from '@ts-core/common';
import { Assets } from '@ts-core/frontend/asset';
import * as _ from 'lodash';
import { ViewUtil } from '../util/ViewUtil';

@Directive({
    selector: '[vi-asset-background]'
})
export class AssetBackgroundDirective extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    @Input()
    public isUrl: boolean = false;
    @Input()
    public isIcon: boolean = false;
    @Input()
    public isImage: boolean = false;

    @Input('background-repeat')
    public repeat: string = 'repeat';

    @Input('background-extension')
    public extension: string = 'png';

    private _background: string;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private element: ElementRef) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private getUrl(id: string, isImage?: boolean, isIcon?: boolean, isUrl?: boolean): string {
        if (_.isNil(id)) {
            return null;
        }
        if (isUrl) {
            return id;
        }
        if (isImage) {
            return Assets.getImage(id, this.extension);
        }
        if (isIcon) {
            return Assets.getIcon(id, this.extension);
        }
        return Assets.getBackground(id, this.extension);
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }
        this.element = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    @Input('vi-asset-background')
    public set background(value: string) {
        if (value === this._background) {
            return;
        }
        this._background = value;
        let url = this.getUrl(value, this.isImage, this.isIcon, this.isUrl);
        ViewUtil.setBackground(this.element.nativeElement, url, this.repeat);
    }
    public get background(): string {
        return this._background;
    }
}
