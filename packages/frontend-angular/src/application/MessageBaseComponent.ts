import { ActivatedRoute } from '@angular/router';
import { DestroyableContainer, LoadableEvent } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import * as _ from 'lodash';

export abstract class MessageBaseComponent extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    //	Constants
    //
    // --------------------------------------------------------------------------

    public static MESSAGE_FILEDS: Array<string> = ['text', 'message', 'error'];

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
        this.addSubscription(
            language.events.subscribe(data => {
                if (data.type === LoadableEvent.COMPLETE) {
                    this.commitLanguageProperties();
                }
            })
        );
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
        for (let item of MessageBaseComponent.MESSAGE_FILEDS) {
            let value = data[item];
            if (!_.isEmpty(value)) {
                return value;
            }
        }
        return null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract refresh(): void;
}
