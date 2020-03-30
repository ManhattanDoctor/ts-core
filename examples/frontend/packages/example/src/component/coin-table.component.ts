import { Component, ElementRef } from '@angular/core';
import { ViewUtil, SmartTableBaseComponent } from '@ts-core/frontend-angular';
import { LanguageService } from '@ts-core/frontend/language';
import { Coin, CoinMapCollection } from '../service/CoinMapCollection';

@Component({
    selector: 'coin-table',
    template: `
        <ng2-smart-table
            [settings]="settings"
            [source]="table?.table"
            (userRowSelect)="rowClick.emit($event.data)"
            (create)="createClick.emit($event)"
            (edit)="editClick.emit($event.data)"
            (delete)="deleteClick.emit($event.data)"
        ></ng2-smart-table>
    `
})
export class CoinTableComponent extends SmartTableBaseComponent<Coin, CoinMapCollection> {
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
        let coinId = new TableDataColumn<Coin>('coinId');
        coinId.class = 'column-m';
        item.columns[coinId.name] = coinId;
        */
        this.checkSettings(item);
        return item;
    }
}
