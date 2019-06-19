import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Loadable, LoadableEvent, LoadableStatus } from '../../../common';
import { ExtendedError } from '../../../common/error';
import { MapCollection } from '../../../common/map';
import { ObservableData } from '../../../common/observer';
import { PromiseReflector, PromiseStatus } from '../../../common/promise';
import { Language } from '../../language';
import { CloneUtil } from '../../util';
import { CookieService } from '../cookie';
import { ILanguageTranslator } from './ILanguageTranslator';
import { LanguageTranslator } from './LanguageTranslator';

@Injectable()
export class LanguageService extends Loadable<LanguageServiceEvent, Language> {
    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    private url: string;
    private default: Language;
    private isInitialized: boolean;

    private _language: Language;
    private _languages: MapCollection<Language>;
    private _translator: ILanguageTranslator;
    private _rawTranslation: any;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private http: HttpClient, private cookies: CookieService) {
        super();
        this._translator = new LanguageTranslator();
        this.addDestroyable(this.translator);
        /*
        this.parser.events.subscribe(data => {
            if (data.type == LanguageServiceEvent.PARSE_ERROR) {
                this.observer.next(new ObservableData(LanguageServiceEvent.PARSE_ERROR));
            }
        });
        */
    }

    //--------------------------------------------------------------------------
    //
    //	Private Methods
    //
    //--------------------------------------------------------------------------

    private loadLanguage(language: Language): void {
        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, language));

        Promise.all([
            PromiseReflector.create(this.http.get(this.url + language.locale + '.json').toPromise()),
            PromiseReflector.create(this.http.get(this.url + language.locale + 'Custom.json').toPromise())
        ]).then(results => {
            if (this.isDestroyed) {
                return;
            }
            let items = results.filter(item => item.status === PromiseStatus.COMPLETE);
            if (!_.isEmpty(items)) {
                let translation = {} as any;
                items.forEach(item => CloneUtil.deepExtend(translation, item.value));
                this.setLanguage(language, translation);
            } else {
                this.status = LoadableStatus.ERROR;
                this.observer.next(new ObservableData(LoadableEvent.ERROR, language, new ExtendedError(`Unable to load language: ${language}`)));
                this.observer.next(new ObservableData(LoadableEvent.FINISHED, language));
            }
        });
    }

    private setLanguage(language: Language, translation: Object): void {
        this._language = language;
        this._rawTranslation = translation;
        this._translator.setLocale(language.locale, translation);

        this.cookies.put('vi-language', language.locale);

        this.status = LoadableStatus.LOADED;
        this.observer.next(new ObservableData(LoadableEvent.COMPLETE, language));
        this.observer.next(new ObservableData(LoadableEvent.FINISHED, language));
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public initialize(url: string, languages: MapCollection<Language>, defaultLanguage: string): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }
        if (_.isEmpty(url)) {
            throw new ExtendedError('Unable to initialize: url is undefined or empty');
        }
        if (_.isEmpty(languages)) {
            throw new ExtendedError('Unable to initialize: available languages is undefined or empty');
        }
        if (!languages.has(defaultLanguage)) {
            throw new ExtendedError('Unable to initialize: default language is undefined or doesnt contain in languages');
        }

        this._languages = languages;

        this.url = url;
        this.default = this.languages.get(defaultLanguage);
        this.isInitialized = true;
    }

    public load(locale?: string | Language): void {
        if (!this.isInitialized) {
            throw new ExtendedError('Service in not initialized');
        }

        let value = locale instanceof Language ? locale.locale : locale;
        if (!value) {
            value = this.cookies.get('vi-language');
        }

        if (!value || !this._languages.has(value)) {
            value = this.default.locale;
        }

        let language = this._languages.get(value);
        if (!this.language || !this.language.toEqual(language)) {
            this.loadLanguage(language);
        } else {
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, language));
        }
    }

    public translate(key: string, params?: Object): string {
        return this.translator.translate(key, params);
    }

    public isHasTranslation(key: string): boolean {
        return this.translator.isHasTranslation(key);
    }

    public destroy(): void {
        super.destroy();

        this._language = null;
        this._languages = null;
        this._rawTranslation = null;
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get translator(): ILanguageTranslator {
        return this._translator;
    }

    public get rawTranslation(): any {
        return this._rawTranslation;
    }

    public get locale(): string {
        return this.language ? this.language.locale : this.defaultLocale;
    }

    public get defaultLocale(): string {
        return this.default ? this.default.locale : null;
    }

    public get language(): Language {
        return this._language;
    }
    public set language(value: Language) {
        if (value === this._language) {
            return;
        }
        this._language = value;
        this.load(value);
    }

    public get languages(): MapCollection<Language> {
        return this._languages;
    }
}

export enum LanguageServiceEvent {}
