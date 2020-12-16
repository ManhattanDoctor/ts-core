import { DestroyableContainer, IDestroyable } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { DestroyableMapCollection } from '@ts-core/common/map';
import { ObservableData } from '@ts-core/common/observer';
import { ObjectUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import * as MessageFormat from 'messageformat';
import { Observable, Subject } from 'rxjs';
import { ILanguageTranslator, LanguageTranslatorEvent, ILanguageTranslatorItem } from './ILanguageTranslator';

export class LanguageTranslator extends DestroyableContainer implements ILanguageTranslator {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private linkSymbol: string = '⇛';
    private locale: LocaleContainer;
    private locales: DestroyableMapCollection<LocaleContainer>;

    private observer: Subject<ObservableData<LanguageTranslatorEvent, ExtendedError>>;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.observer = new Subject();
        this.locales = new DestroyableMapCollection('locale');
        this.addDestroyable(this.locales);
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private getLink(text: string): string {
        if (_.isNil(text) || _.isNil(this.linkSymbol) || text.indexOf(this.linkSymbol) !== 0) {
            return null;
        }
        return text.substr(1).trim();
    }

    private getUniqueKey(item: ILanguageTranslatorItem): string {
        return !_.isNil(item.params) ? `${item.key}_${JSON.stringify(ObjectUtil.sortKeys(item.params))}` : item.key;
    }

    private validate(item: ILanguageTranslatorItem): string {
        let text = null;
        let type = null;
        if (_.isNil(this.locale)) {
            text = `Locale is undefined`;
            type = LanguageTranslatorEvent.LOCALE_UNDEFINED;
        } else if (_.isNil(item.key)) {
            text = `Key is undefined`;
            type = LanguageTranslatorEvent.KEY_UNDEFINED;
        } else if (!_.isString(item.key)) {
            text = `Key must be string`;
            type = LanguageTranslatorEvent.KEY_INVALID;
        }

        if (!_.isNil(text)) {
            this.observer.next(new ObservableData(type, null, new ExtendedError(text, null, item)));
        }

        return text;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public translate(item: ILanguageTranslatorItem): string {
        let text = this.validate(item);
        if (!_.isNil(text)) {
            return text;
        }

        let uniqueKey = this.getUniqueKey(item);
        text = this.locale.translations.get(uniqueKey);
        if (!_.isNil(text)) {
            return text;
        }

        let { key, params } = item;
        if (this.isHasTranslation(key)) {
            text = this.locale.translate(key, params);
            let link = this.getLink(text);
            if (!_.isNil(link)) {
                return this.translate({ key: link, params });
            }
        } else {
            text = key;
            this.observer.next(new ObservableData(LanguageTranslatorEvent.KEY_NOT_FOUND, null, new ExtendedError(text, null, item)));
        }
        this.locale.translations.set(uniqueKey, text);
        return text;
    }

    public compile(item: ILanguageTranslatorItem): string {
        let text = this.validate(item);
        return !_.isNil(text) ? text : this.locale.compile(item.key, item.params);
    }

    public setLocale(locale: string, rawTranslation: any): void {
        this.locale = this.locales.get(locale);
        if (_.isNil(this.locale)) {
            this.locale = this.locales.add(new LocaleContainer(locale, rawTranslation));
        }
    }

    public isHasTranslation(key: string): boolean {
        return !_.isNil(this.locale) ? this.locale.isHasTranslation(key) : false;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LanguageTranslatorEvent, ExtendedError>> {
        return this.observer.asObservable();
    }
}

export class LocaleContainer extends IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private formatter: any;
    public translations: Map<string, string>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(public locale: string, public rawTranslation: any) {
        super();
        this.formatter = new MessageFormat(locale);
        this.translations = new Map();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public translate(key: string, params?: any): string {
        return this.compile(_.get(this.rawTranslation, key), params);
    }

    public compile(expression: string, params?: any): string {
        return this.formatter.compile(expression)(!_.isNil(params) ? params : {});
    }

    public isHasTranslation(key: string): boolean {
        return _.isString(_.get(this.rawTranslation, key));
    }

    public destroy(): void {
        this.locale = null;
        this.formatter = null;
        if (!_.isNil(this.translations)) {
            this.translations.clear();
            this.translations = null;
        }
    }
}
