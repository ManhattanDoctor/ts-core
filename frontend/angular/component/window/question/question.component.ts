import { Component, ViewContainerRef } from '@angular/core';
import { LanguageService } from '../../../language';
import { ViewUtil } from '../../../util';
import { WindowQuestionBaseComponent } from '../WindowQuestionBaseComponent';

@Component({
    templateUrl: 'question.component.html'
})
export class QuestionComponent extends WindowQuestionBaseComponent {
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

        this.data.yesText = this.language.translate(this.data.options.yesTextId);
        this.data.notText = this.language.translate(this.data.options.notTextId);
        this.data.checkText = this.language.translate(this.data.options.checkTextId);
        this.data.closeText = this.language.translate(this.data.options.closeTextId);
    }
}
