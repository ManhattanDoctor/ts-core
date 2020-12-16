import { Loadable, LoadableEvent, LoadableStatus } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { MapCollection } from '@ts-core/common/map';
import { ObservableData } from '@ts-core/common/observer';
import { PromiseReflector } from '@ts-core/common/promise';
import { CloneUtil } from '@ts-core/common/util';
import axios from 'axios';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { CookieStorageUtil, ICookieStorageOptions } from '../cookie';
import { ILanguageTranslator, LanguageTranslatorEvent } from './ILanguageTranslator';
import { Language } from './Language';
import { LanguageTranslator } from './LanguageTranslator';

export class LanguageService extends Loadable<LanguageTranslatorEvent, Language> {
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

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private options?: ILanguageServiceOptions) {
        super();
        this._translator = new LanguageTranslator();

        this.addDestroyable(this.translator);
        this.translator.events.pipe(takeUntil(this.destroyed)).subscribe(event => {
            this.observer.next(new ObservableData(event.type, this.language, event.error));
        });
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private async load(locale?: string | Language): Promise<void> {
        if (locale instanceof Language) {
            locale = locale.locale;
        }

        let language = this.languages.get(locale);
        if (_.isNil(language)) {
            throw new ExtendedError(`Can't find locale ${locale}`);
        }

        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, language));

        let files = this.filePrefixes.map(item => PromiseReflector.create(axios.get(this.url + language.locale + item)));
        let items = await Promise.all(files);
        if (this.isDestroyed) {
            return;
        }

        items = items.filter(item => item.isComplete);
        if (_.isEmpty(items)) {
            this.status = LoadableStatus.ERROR;
            this.observer.next(new ObservableData(LoadableEvent.ERROR, language, new ExtendedError(`Unable to load language "${language.name}"`)));
            this.observer.next(new ObservableData(LoadableEvent.FINISHED, language));
            return;
        }

        let translation = {};
        items.forEach(item => CloneUtil.deepExtend(translation, item.value.data));

        this._language = language;
        this._rawTranslation = translation;
        this._translator.setLocale(this._language.locale, this._rawTranslation);

        CookieStorageUtil.put(this.options, this._language.locale);

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
            throw new ExtendedError('Url is undefined or empty');
        }
        if (_.isEmpty(languages)) {
            throw new ExtendedError('Available languages is undefined or empty');
        }

        this._languages = languages;

        this.url = url;
        this.isInitialized = true;
    }

    public loadIfExist(defaultLocale?: string): void {
        if (!this.isInitialized) {
            throw new ExtendedError('Service in not initialized');
        }
        this.load(CookieStorageUtil.get(this.options) || defaultLocale);
    }

    public compile(key: string, params?: Object): string {
        return this.translator.compile({ key, params });
    }

    public translate(key: string, params?: Object): string {
        return this.translator.translate({ key, params });
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

export interface ILanguageServiceOptions extends ICookieStorageOptions {}
