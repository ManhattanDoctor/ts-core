import { MatPaginatorIntl } from '@angular/material';
import { LoadableEvent } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import { Subscription } from 'rxjs';

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
        this.getRangeLabel = this.languageRangeLabel;
    }

    private languageRangeLabel = (page: number, pageSize: number, length: number): string => {
        let translation = { current: '0', total: '0' };
        if (length == 0 || pageSize == 0) {
            translation.total = length.toString();
        } else {
            length = Math.max(length, 0);
            let startIndex = page * pageSize;
            let endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            translation.current = `${startIndex + 1} – ${endIndex}`;
            translation.total = length.toString();
        }
        return this.language.translate('general.pageRange', translation);
    };

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
