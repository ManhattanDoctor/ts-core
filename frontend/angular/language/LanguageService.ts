import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';
import { Loadable, LoadableEvent, LoadableStatus } from '../../../common';
import { MapCollection } from '../../../common/map';
import { ObservableData } from '../../../common/observer';
import { Language } from './Language';
import { LanguageMessageFormatParser } from './LanguageMessageFormatParser';
import { ExtendedError } from '../../../common/error/ExtendedError';

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
    private _rawTranslation: any;

    private parser: LanguageMessageFormatParser;
    private subscription: Subscription;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private cookies: CookieService, private translation: TranslateService) {
        super();
        this._languages = new MapCollection<Language>('id');

        this.parser = translation.parser as LanguageMessageFormatParser;
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

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        /*
        this.subscription = this.http.get(this.getLanguageUrl(language)).subscribe(
            json => {
                this.subscription.unsubscribe();
                this.subscription = this.http.get(this.getCustomLanguageUrl(language)).subscribe(
                    jsonCustom => {
                        let translation = CloneUtil.deepExtend(json, jsonCustom);
                        this.setLanguage(language, translation);
                    },
                    error => {
                        this.setLanguage(language, json);
                    }
                );
            },
            error => {
                this.status = LoadableStatus.ERROR;
                this.observer.next(new ObservableData(LoadableEvent.ERROR, language, error.error.error));
                this.observer.next(new ObservableData(LoadableEvent.FINISHED, language));
            }
        );
        */
    }

    private setLanguage(language: Language, translation: Object): void {
        this._language = language;
        this._rawTranslation = translation;

        this.translation.setTranslation(language.locale, translation);
        this.translation.use(language.locale);
        this.parser.locale = language.locale;

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

    public initialize(url: string, languages: Map<string, string>, defaultLanguage: string): void {
        if (this.isInitialized) {
            throw new Error('Service already initialized');
        }
        if (!url) {
            throw new ExtendedError('Unable to initialize: url is undefined or empty');
        }
        if (!languages || languages.size == 0) {
            throw new ExtendedError('Unable to initialize: available languages is undefined or empty');
        }
        if (!languages.has(defaultLanguage)) {
            throw new ExtendedError('Unable to initialize: default language is undefined or doesnt contain in available languages');
        }

        languages.forEach((name, locale) => this._languages.add(new Language(locale, name)));

        this.url = url;
        this.default = this._languages.get(defaultLanguage);
        this.isInitialized = true;
    }

    public destroy(): void {
        super.destroy();

        this.parser = null;
        this._language = null;
        this._rawTranslation = null;

        if (this._languages) {
            this._languages.destroy();
            this._languages = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    public load(value?: string | Language): void {
        let item = value instanceof Language ? value.locale : value;
        if (!item) {
            item = this.cookies.get('vi-language');
        }

        if (!item || !this._languages.has(item)) {
            item = this.default.locale;
        }

        let language = this._languages.get(item);
        if (!this.language || !this.language.toEqual(language)) {
            this.loadLanguage(language);
        } else {
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, language));
        }
    }

    public translate(key: string, params?: Object): string {
        return this.translation.instant(key, params);
    }

    public compile(text: string, params: Object): string {
        return this.parser.compile(text, params);
    }

    public hasTranslation(key: string, params?: Object): boolean {
        return this.translation.instant(key, params) !== key;
    }

    public getRawTranslation(): any {
        return this._rawTranslation;
    }

    public getLanguageUrl(item: Language): string {
        return this.url + item.locale + '.json';
    }

    public getCustomLanguageUrl(item: Language): string {
        return this.url + item.locale + 'Custom.json';
    }
    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get locale(): string {
        return this.language ? this.language.locale : this.defaultLocale;
    }

    public get defaultLocale(): string {
        return this.default ? this.default.locale : null;
    }

    public get language(): Language {
        return this._language;
    }

    public get languages(): MapCollection<Language> {
        return this._languages;
    }
}

export enum LanguageServiceEvent {
    PARSE_ERROR = 'PARSE_ERROR'
}
