import { Component, ElementRef } from '@angular/core';
import { SmartTableBaseComponent, ViewUtil } from '@ts-core/frontend-angular';
import { LanguageService } from '@ts-core/frontend/language';
import { CoinBlock, CoinBlockMapCollection } from '../service/CoinBlockMapCollection';

@Component({
    selector: 'coin-block-table',
    template: `
        <ng2-smart-table
            [settings]="settings"
            [source]="table?.table"
            (userRowSelect)="rowClick.emit($event.data)"
            (create)="createClick.emit($event)"
            (edit)="editClick.emit($event.data)"
            (delete)="deleteClick.emit($event.data)"></ng2-smart-table>`
})
export class CoinBlockTableComponent extends SmartTableBaseComponent<CoinBlock, CoinBlockMapCollection> {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(element: ElementRef, language: LanguageService) {
        super(language);
        ViewUtil.addClasses(element, 'd-block');
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    protected getTableSettings(): any {
        let item = {} as any;
        item.columns = {};
        item.noDataMessage = 'Hello';

        /*
        let coinId = new TableDataColumn<CoinBlock>('coinId');
        coinId.class = 'column-m';
        item.columns[coinId.name] = coinId;

        let blockHeight = new TableDataColumn<CoinBlock>('blockHeight');
        blockHeight.class = 'column-m';
        item.columns[blockHeight.name] = blockHeight;
        */
        this.checkSettings(item);
        return item;
    }
}
