import { Component, Input } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import * as _ from 'lodash';
import { ISelectListItem } from '../../list/select/ISelectListItem';
import { SelectListItems } from '../../list/select/SelectListItems';

@Component({
    selector: 'vi-tab-group',
    templateUrl: 'tab-group.component.html'
})
export class TabGroupComponent<T = any> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    @Input()
    public list: SelectListItems<ISelectListItem<T>>;

    @Input()
    public className: string;
}
