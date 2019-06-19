import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { DestroyableContainer, IDestroyable } from '../../../common';
import { ExtendedError } from '../../../common/error';
import { DestroyableMapCollection } from '../../../common/map';
import { ObservableData } from '../../../common/observer';
import { ObjectUtil } from '../../../common/util';
import { ILanguageTranslator, LanguageTranslatorEvent } from './ILanguageTranslator';

export class LanguageTranslator extends DestroyableContainer implements ILanguageTranslator {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private linkSymbol: string = '⇛';
    private locale: LocaleContainer;
    private locales: DestroyableMapCollection<LocaleContainer>;

    private observer: Subject<ObservableData<LanguageTranslatorEvent, ExtendedError>>;

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    constructor() {
        super();
        this.observer = new Subject();
        this.locales = new DestroyableMapCollection('locale');
        this.addDestroyable(this.locales);
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    private getLink(text: string): string {
        if (_.isNil(text) || _.isNil(this.linkSymbol) || text.indexOf(this.linkSymbol) !== 0) {
            return null;
        }
        return text.substr(1).trim();
    }

    private getUniqueKey(key: string, params?: any): string {
        return !_.isNil(params) ? key + '_' + JSON.stringify(ObjectUtil.sortKeys(params)) : key;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public translate(key: string, params?: any): string {
        if (_.isNil(key)) {
            this.observer.next(new ObservableData(LanguageTranslatorEvent.PARSE_ERROR, new ExtendedError(`Expression is undefined`)));
            return null;
        }

        let uniqueKey = this.getUniqueKey(key, params);
        let text = this.locale.translations.get(uniqueKey);
        if (!_.isNil(text)) {
            return text;
        }

        let link = this.getLink(text);
        if (!_.isNil(link)) {
            return this.translate(link, params);
        }

        if (this.isHasTranslation(key)) {
            text = this.locale.translate(key, params);
        } else {
            text = key;
        }
        this.locale.translations.set(uniqueKey, text);
        return text;
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

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LanguageTranslatorEvent, Error>> {
        return this.observer.asObservable();
    }
}

export class LocaleContainer extends IDestroyable {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private formatter: any;
    public translations: Map<string, string>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(public locale: string, public rawTranslation: any) {
        super();
        this.formatter = new MessageFormat(locale);
        this.translations = new Map();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public translate(key: string, params?: any): string {
        return this.compile(_.get(this.rawTranslation, key), params);
    }

    public compile(text: string, params?: any): string {
        return this.formatter.compile(text)(!_.isNil(params) ? params : {});
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

declare let MessageFormat: any;
