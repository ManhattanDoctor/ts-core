import { Component, ViewContainerRef } from '@angular/core';
import { LanguageService } from '@ts-core/frontend/language';
import { NotificationService } from '../../../notification/NotificationService';
import { ViewUtil } from '../../../util/ViewUtil';
import { NotificationQuestionBaseComponent } from '../NotificationQuestionBaseComponent';
import * as _ from 'lodash';

@Component({
    selector: 'vi-notification',
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

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public remove(): void {
        super.remove();
        if (_.isNil(this.notification)) {
            this.notifications.remove(this.config);
        }
    }
}
