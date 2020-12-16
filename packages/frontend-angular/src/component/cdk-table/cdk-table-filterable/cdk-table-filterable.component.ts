import * as _ from 'lodash';
import { CdkTableBaseComponent } from '../CdkTableBaseComponent';
import { CdkTableFilterableMapCollection } from '../CdkTableFilterableMapCollection';
import { Component } from '@angular/core';

@Component({
    selector: 'vi-cdk-table-filterable',
    templateUrl: 'cdk-table-filterable.component.html'
})
export class CdkTableFilterableComponent<U = any, V = any> extends CdkTableBaseComponent<CdkTableFilterableMapCollection<U, V>, U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super({
            noDataId: 'general.noDataFound',
            isInteractive: true
        });
    }
}
