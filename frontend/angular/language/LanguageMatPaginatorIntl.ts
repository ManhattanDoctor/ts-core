import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material';
import { Subscription } from 'rxjs';
import { LoadableEvent } from '../../../common';
import { LanguageService } from './LanguageService';

@Injectable()
export class LanguageMatPaginatorIntl extends MatPaginatorIntl {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    public lastPageLabel: string;
    public nextPageLabel: string;
    public firstPageLabel: string;
    public previousPageLabel: string;
    public itemsPerPageLabel: string;

    private subscription: Subscription;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private language: LanguageService) {
        super();

        this.commitLanguageProperties();
        this.subscription = this.language.events.subscribe(data => {
            if (data.type === LoadableEvent.COMPLETE) {
                this.commitLanguageProperties();
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private commitLanguageProperties(): void {
        this.lastPageLabel = this.language.translate('general.lastPage');
        this.nextPageLabel = this.language.translate('general.nextPage');
        this.firstPageLabel = this.language.translate('general.firstPage');
        this.previousPageLabel = this.language.translate('general.previousPage');
        this.itemsPerPageLabel = this.language.translate('general.itemsPerPage');
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
