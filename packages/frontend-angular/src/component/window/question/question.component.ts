import { Component, ViewContainerRef } from '@angular/core';
import { LanguageService } from '@ts-core/frontend/language';
import { ViewUtil } from '../../../util/ViewUtil';
import { WindowQuestionBaseComponent } from '../WindowQuestionBaseComponent';
import * as _ from 'lodash';

@Component({
    templateUrl: 'question.component.html'
})
export class QuestionComponent extends WindowQuestionBaseComponent {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public text: string;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(container: ViewContainerRef, protected language: LanguageService) {
        super(container);
        ViewUtil.addClasses(container.element, 'd-block');
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    protected commitConfigProperties(): void {
        super.commitConfigProperties();

        if (!_.isNil(this.data.text)) {
            this.text = this.data.text.replace(/(?:\r\n|\r|\n)/g, `<br/>`);
        }

        if (this.language.isHasTranslation(this.data.options.yesTextId)) {
            this.data.yesText = this.language.translate(this.data.options.yesTextId);
        }
        if (this.language.isHasTranslation(this.data.options.notTextId)) {
            this.data.notText = this.language.translate(this.data.options.notTextId);
        }
        if (this.language.isHasTranslation(this.data.options.checkTextId)) {
            this.data.checkText = this.language.translate(this.data.options.checkTextId);
        }
        if (this.language.isHasTranslation(this.data.options.closeTextId)) {
            this.data.closeText = this.language.translate(this.data.options.closeTextId);
        }
    }
}
