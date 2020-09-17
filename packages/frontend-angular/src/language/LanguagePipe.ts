import { Pipe, PipeTransform } from '@angular/core';
import { DestroyableContainer, LoadableEvent } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import { takeUntil } from 'rxjs/operators';

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
        language.completed.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.updateValue();
        });
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private updateValue(): void {
        this._value = this.language.translate(this.key, this.params);
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public transform(key: string, params?: any): string {
        this.key = key;
        this.params = params;
        if (!this._value) {
            this.updateValue();
        }
        return this._value;
    }
}
