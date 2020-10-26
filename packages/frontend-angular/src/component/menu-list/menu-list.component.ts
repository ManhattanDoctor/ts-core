import { Component, Input } from '@angular/core';
import { DestroyableContainer } from '@ts-core/common';
import * as _ from 'lodash';
import { ListItems } from '../../list/ListItems';
import { IListItem } from '../../list/IListItem';

@Component({
    selector: 'vi-menu-list',
    templateUrl: 'menu-list.component.html'
})
export class MenuListComponent<T = any> extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    @Input()
    public list: ListItems<IListItem<T>>;
}
