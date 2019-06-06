import { TranslateParser } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { ObjectUtil } from '../../../common/util/ObjectUtil';
import { LanguageServiceEvent } from './LanguageService';

export class LanguageMessageFormatParser extends TranslateParser {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private _locale: string;
    private formatter: any;

    private lastKey: string;
    private lastTarget: any;
    private linkSymbol: string = '⇛';

    private formatters: Map<string, any>;
    private translations: Map<string, string>;

    private observer: Subject<ObservableData<LanguageServiceEvent, Error>>;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.observer = new Subject();

        this.formatters = new Map();
        this.translations = new Map();
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private getLink(text: string): string {
        if (_.isNil(this.linkSymbol)) {
            return null;
        }
        if (text.indexOf(this.linkSymbol) !== 0) {
            return null;
        }
        return text.substr(1).trim();
    }

    private getUniqueKey(key: string, params?: any): string {
        if (_.isNil(params)) {
            return key;
        }
        return key + '_' + JSON.stringify(ObjectUtil.sortKeys(params));
    }

    private getFormatter(locale: string): any {
        let value = this.formatters.get(locale);
        if (value) {
            return value;
        }
        try {
            value = new MessageFormat(locale);
        } catch (error) {
            locale = 'en';
            value = this.formatters.get(locale);
            if (!value) {
                value = new MessageFormat(locale);
            }
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public interpolate(expression: string, params?: any): string {
        let uniqueKey = this.getUniqueKey(this.lastKey, params);
        let text = this.translations.get(uniqueKey);
        if (!_.isNil(text)) {
            return text;
        }

        if (_.isNil(expression)) {
            text = this.lastKey;
            this.observer.next(new ObservableData(LanguageServiceEvent.PARSE_ERROR, new Error(`Expression is undefined`)));
        }

        if (!this.formatter) {
            text = this.lastKey;
            this.observer.next(new ObservableData(LanguageServiceEvent.PARSE_ERROR, new Error(`Formatter is undefined`)));
        }

        if (_.isNil(text)) {
            try {
                text = this.compile(expression, params);
                let link = this.getLink(text);
                if (_.isNil(link)) {
                    text = this.interpolate(this.getValue(this.lastTarget, link), params);
                }
            } catch (error) {
                text = this.lastKey;
                this.observer.next(new ObservableData(LanguageServiceEvent.PARSE_ERROR, new Error(`Error parsing ${name} :\n\n ${error.message}`)));
            }
        }

        this.translations.set(uniqueKey, text);
        return text;
    }

    public getValue(target: any, key: string): string {
        this.lastKey = key;
        this.lastTarget = target;

        let keys = key.split('.');
        key = '';
        do {
            key += keys.shift();
            if (target && target[key] && (typeof target[key] === 'object' || !keys.length)) {
                target = target[key];
                key = '';
            } else if (!keys.length) {
                target = undefined;
            } else {
                key += '.';
            }
        } while (keys.length);
        return target;
    }

    public compile(text: string, params?: any): string {
        if (_.isNil(params)) {
            params = {};
        }
        return this.formatter.compile(text)(params);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<LanguageServiceEvent, Error>> {
        return this.observer.asObservable();
    }

    public get locale(): string {
        return this._locale;
    }
    public set locale(value: string) {
        if (value === this._locale) {
            return;
        }
        this._locale = value;
        this.translations.clear();

        this.formatter = value ? this.getFormatter(value) : null;
        if (this.formatter) {
            this.formatters.set(this.locale, this.formatter);
        }
    }
}

declare let MessageFormat: any;
