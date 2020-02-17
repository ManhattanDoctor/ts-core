import { Component, ViewContainerRef } from '@angular/core';
import { LanguageService } from '@ts-core/frontend/language';
import { NotificationService } from '../../../notification';
import { ViewUtil } from '../../../util';
import { NotificationQuestionBaseComponent } from '../NotificationQuestionBaseComponent';

@Component({
    selector: 'notification',
    templateUrl: 'notification.component.html',
    styleUrls: ['notification.component.scss']
})
export class NotificationComponent extends NotificationQuestionBaseComponent {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(container: ViewContainerRef, private language: LanguageService, private notifications: NotificationService) {
        super(container);
        ViewUtil.addClasses(container.element, 'd-block');
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitConfigProperties(): void {
        super.commitConfigProperties();

        this.data.yesText = this.language.translate(this.data.options.yesTextId);
        this.data.notText = this.language.translate(this.data.options.notTextId);
        this.data.checkText = this.language.translate(this.data.options.checkTextId);
        this.data.closeText = this.language.translate(this.data.options.closeTextId);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public remove(): void {
        super.remove();
        if (!this.notification) {
            this.notifications.remove(this.config);
        }
    }
}
