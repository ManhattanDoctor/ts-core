import { Pipe, PipeTransform } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

@Pipe({
    name: 'viTranslate',
    pure: false
})
export class LanguagePipe extends DestroyableContainer implements PipeTransform {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private key: string;
    private params: string;
    private _value: string;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private language: LanguageService) {
        super();
        language.completed.pipe(takeUntil(this.destroyed)).subscribe(this.valueUpdate);
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private valueUpdate = (): void => {
        this._value = this.language.translate(this.key, this.params);
    };

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(key: string, params?: any): string {
        this.key = key;
        this.params = params;
        if (_.isNil(this._value)) {
            this.valueUpdate();
        }
        return this._value;
    }

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }
        this.key = null;
        this.params = null;
    }
}
