import { Component, ElementRef, Input } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import { ViewUtil } from '../../../util/ViewUtil';

@Component({
    selector: 'vi-language-selector',
    templateUrl: 'language-selector.component.html'
})
export class LanguageSelectorComponent extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private _isNeedIcon: boolean = true;
    private _isNeedLabel: boolean = true;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected element: ElementRef, public language: LanguageService) {
        super();
        ViewUtil.addClasses(element, 'd-block');
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitIsNeedLabelProperties(): void {
        ViewUtil.toggleClass(this.element, 'no-label', !this.isNeedLabel);
    }

    protected commitIsNeedIconProperties(): void {
        ViewUtil.toggleClass(this.element, 'no-icon', !this.isNeedLabel);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isNeedIcon(): boolean {
        return this._isNeedIcon;
    }
    @Input()
    public set isNeedIcon(value: boolean) {
        if (value === this._isNeedIcon) {
            return;
        }
        this._isNeedIcon = value;
        this.commitIsNeedIconProperties();
    }

    public get isNeedLabel(): boolean {
        return this._isNeedLabel;
    }
    @Input()
    public set isNeedLabel(value: boolean) {
        if (value === this._isNeedLabel) {
            return;
        }
        this._isNeedLabel = value;
        this.commitIsNeedLabelProperties();
    }
}
