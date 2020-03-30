import { DestroyableContainer, IDestroyable } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { DestroyableMapCollection } from '@ts-core/common/map';
import { ObservableData } from '@ts-core/common/observer';
import { ObjectUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import * as MessageFormat from 'messageformat';
import { Observable, Subject } from 'rxjs';
import { ILanguageTranslator, LanguageTranslatorEvent } from './ILanguageTranslator';

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

    private getUniqueKey(key: string, params?: any): string {
        return !_.isNil(params) ? key + '_' + JSON.stringify(ObjectUtil.sortKeys(params)) : key;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public translate(key: string, params?: any): string {
        if (_.isNil(this.locale)) {
            this.observer.next(new ObservableData(LanguageTranslatorEvent.INVALID_LOCALE, new ExtendedError(`Locale is undefined`, null, key)));
            return null;
        }
        if (_.isNil(key)) {
            this.observer.next(new ObservableData(LanguageTranslatorEvent.INVALID_KEY, new ExtendedError(`Key is undefined`, null, key)));
            return null;
        }

        let uniqueKey = this.getUniqueKey(key, params);
        let text = this.locale.translations.get(uniqueKey);
        if (!_.isNil(text)) {
            return text;
        }

        if (this.locale.isHasTranslation(key)) {
            text = this.locale.translate(key, params);
            let link = this.getLink(text);
            if (!_.isNil(link)) {
                return this.translate(link, params);
            }
        } else {
            text = key;
        }
        this.locale.translations.set(uniqueKey, text);
        return text;
    }

    public compile(expression: string, params?: any): string {
        if (_.isNil(expression)) {
            this.observer.next(new ObservableData(LanguageTranslatorEvent.INVALID_EXPRESSION, new ExtendedError(`Expression is undefined`, null, expression)));
            return null;
        }
        return this.locale.compile(expression, params);
    }

    public setLocale(locale: string, rawTranslation: any): void {
        this.locale = this.locales.get(locale);
        if (_.isNil(this.locale)) {
            this.locale = this.locales.add(new LocaleContainer(locale, rawTranslation));
        }
    }

    public isHasTranslation(key: string): boolean {
        return this.locale.isHasTranslation(key);
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
        return _.hasIn(this.rawTranslation, key);
    }

    public destroy(): void {
        this.locale = null;
        this.formatter = null;
        if (this.translations) {
            this.translations.clear();
            this.translations = null;
        }
    }
}
