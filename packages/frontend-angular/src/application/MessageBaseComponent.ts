import { ActivatedRoute } from '@angular/router';
import { DestroyableContainer, LoadableEvent } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';

export abstract class MessageBaseComponent extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    public text: string;
    public refreshText: string = 'Refresh';

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected route: ActivatedRoute, protected language: LanguageService) {
        super();
        // this.login.isAutoLogin = true

        this.text = this.getText();
        if (this.language.isLoaded) {
            this.commitLanguageProperties();
        }
        language.completed.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.commitLanguageProperties();
        });
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitLanguageProperties(): void {
        if (this.language.isHasTranslation('general.refresh')) {
            this.refreshText = this.language.translate('general.refresh');
        }
    }

    protected getText(): string {
        let value = this.getValue(this.route.snapshot.queryParams);
        if (_.isNil(value)) {
            value = this.getValue(this.route.snapshot.params);
        }
        return value;
    }

    protected getValue(data: any): string {
        for (let item of this.getMessageFields()) {
            let value = data[item];
            if (!_.isEmpty(value)) {
                return value;
            }
        }
        return null;
    }

    protected getMessageFields(): Array<string> {
        return ['text', 'message', 'error'];
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract refresh(): void;
}
