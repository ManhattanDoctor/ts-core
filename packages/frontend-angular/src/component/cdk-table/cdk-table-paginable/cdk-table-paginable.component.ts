import * as _ from 'lodash';
import { CdkTableBaseComponent } from '../CdkTableBaseComponent';
import { CdkTablePaginableMapCollection } from '../CdkTablePaginableMapCollection';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'vi-cdk-table-paginable',
    templateUrl: 'cdk-table-paginable.component.html'
})
export class CdkTablePaginableComponent<U = any, V = any> extends CdkTableBaseComponent<CdkTablePaginableMapCollection<U, V>, U, V> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _paginator: ICdkTablePaginatorSettings;

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
        this.paginator = {
            pageSizes: [10, 25, 100],
            hidePageSize: false,
            showFirstLastButtons: true
        };
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected commitPaginatorProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get paginator(): ICdkTablePaginatorSettings {
        return this._paginator;
    }
    @Input()
    public set paginator(value: ICdkTablePaginatorSettings) {
        if (value === this._paginator) {
            return;
        }
        this._paginator = value;
        if (!_.isNil(value)) {
            this.commitPaginatorProperties();
        }
    }
}

export interface ICdkTablePaginatorSettings {
    pageSizes?: Array<number>;
    hidePageSize?: boolean;
    showFirstLastButtons?: boolean;
}
