import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Loadable, LoadableEvent, LoadableStatus } from '../../../common';
import { ExtendedError } from '../../../common/error';
import { MapCollection } from '../../../common/map';
import { ObservableData } from '../../../common/observer';
import { Language } from '../../language';
import { CloneUtil } from '../../util';
import { CookieService } from '../cookie';
import { ILanguageTranslator } from './ILanguageTranslator';
import { LanguageTranslator } from './LanguageTranslator';

@Injectable()
export class LanguageService extends Loadable<LanguageServiceEvent, Language> {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private url: string;
    private isInitialized: boolean;

    private _language: Language;
    private _languages: MapCollection<Language>;
    private _translator: ILanguageTranslator;
    private _rawTranslation: any;

    public filePrefixes: Array<string> = ['.json', 'Custom.json'];
    public cookieStorageName: string = 'vi-language';

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

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

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private load(locale?: string | Language): void {
        if (locale instanceof Language) {
            locale = locale.locale;
        }

        let language = this.languages.get(locale);
        if (!language) {
            throw new ExtendedError(`Unable lo load language: can't find locale ${locale}`);
        }

        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, language));

        let files: Array<Observable<any>> = [];
        for (let prefix of this.filePrefixes) {
            files.push(this.http.get(this.url + language.locale + prefix).pipe(catchError(error => of(error))));
        }

        forkJoin(...files).subscribe(results => {
            if (this.isDestroyed) {
                return;
            }
            let items = results.filter(item => !(item instanceof Error));
            if (!_.isEmpty(items)) {
                let translation = {} as any;
                items.forEach(item => CloneUtil.deepExtend(translation, item));
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

        this.cookies.put(this.cookieStorageName, language.locale);

        this.status = LoadableStatus.LOADED;
        this.observer.next(new ObservableData(LoadableEvent.COMPLETE, language));
        this.observer.next(new ObservableData(LoadableEvent.FINISHED, language));
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public initialize(url: string, languages: MapCollection<Language>): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }
        if (_.isEmpty(url)) {
            throw new ExtendedError('Unable to initialize: url is undefined or empty');
        }
        if (_.isEmpty(languages)) {
            throw new ExtendedError('Unable to initialize: available languages is undefined or empty');
        }

        this._languages = languages;

        this.url = url;
        this.isInitialized = true;
    }

    public loadIfExist(defaultLocale?: string): void {
        if (!this.isInitialized) {
            throw new ExtendedError('Service in not initialized');
        }
        this.load(this.cookies.get(this.cookieStorageName) || defaultLocale);
    }

    public compile(expression: string, params?: Object): string {
        return this.translator.compile(expression, params);
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

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get translator(): ILanguageTranslator {
        return this._translator;
    }

    public get rawTranslation(): any {
        return this._rawTranslation;
    }

    public get locale(): string {
        return this.language ? this.language.locale : null;
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
