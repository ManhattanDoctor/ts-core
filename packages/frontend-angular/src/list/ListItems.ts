import { ArrayUtil } from '@ts-core/common/util';
import { LanguageService } from '@ts-core/frontend/language';
import * as _ from 'lodash';
import { IListItem } from './IListItem';
import { FilterableMapCollection } from '@ts-core/common/map';
import { Subscription } from 'rxjs';

export class ListItems<U extends IListItem<V>, V = any> extends FilterableMapCollection<U> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected lastRefreshParams: Array<any>;
    protected languageSubscription: Subscription;

    protected _isAllEnabled: boolean;
    protected _isLeastOneEnabled: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private language: LanguageService, isAutoTranslate: boolean = true) {
        super('uid');

        this.lastRefreshParams = new Array();
        if (isAutoTranslate) {
            this.languageSubscription = language.completed.subscribe(this.translateItems);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected translate = (item: U): void => {
        item.label = this.language.translate(item.translationId);
    };

    protected translateItems = (): void => {
        this.collection.forEach(this.translate);
    };

    protected translateIfNeed = (item: U): void => {
        if (_.isNil(item.label) && !_.isNil(item.translationId)) {
            this.translate(item);
        }
    };

    protected translateItemsIfNeed = (): void => {
        this.collection.forEach(this.translateIfNeed);
    };

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public complete(): void {
        ArrayUtil.sort(this.collection);
        this.translateItemsIfNeed();
    }

    public refresh(...params): void {
        ArrayUtil.clear(this._filtered);
        this.lastRefreshParams = params;

        if (_.isEmpty(this.collection)) {
            return;
        }

        this._isAllEnabled = true;
        this._isLeastOneEnabled = false;
        for (let item of this._collection) {
            item.isEnabled = !_.isNil(item.checkEnabled) ? item.checkEnabled(item, ...params) : true;
            if (!item.isEnabled) {
                this._isAllEnabled = false;
            } else if (this.filter(item)) {
                this._filtered.push(item);
                this._isLeastOneEnabled = true;
            }
        }
    }

    public actionItem(item: U): void {
        if (!_.isNil(item) && item.isEnabled && !_.isNil(item.action)) {
            item.action(item, ...this.lastRefreshParams);
        }
    }

    public destroy(): void {
        super.destroy();

        this.language = null;
        this.lastRefreshParams = null;

        if (!_.isNil(this.languageSubscription)) {
            this.languageSubscription.unsubscribe();
            this.languageSubscription = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isAllEnabled(): boolean {
        return this._isAllEnabled;
    }

    public get isLeastOneEnabled(): boolean {
        return this._isLeastOneEnabled;
    }
}
