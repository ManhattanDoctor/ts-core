import * as _ from 'lodash';
import { ExtendedError } from '../../common/error/ExtendedError';
import { Destroyable } from '../Destroyable';
import { UrlUtil } from '../util';

export class SettingsBaseService extends Destroyable {
    //--------------------------------------------------------------------------
    //
    //	Static Properties
    //
    //--------------------------------------------------------------------------

    public static LANGUAGE_SEPARATOR: string = ';';
    public static LANGUAGE_CODE_SEPARATOR: string = '|';

    public static LANGUAGE_RU: string = 'ru';
    public static LANGUAGE_RU_CODE: string = '0';

    public static LANGUAGE_EN: string = 'en';
    public static LANGUAGE_EN_CODE: string = '3';

    //--------------------------------------------------------------------------
    //
    //	Private Properties
    //
    //--------------------------------------------------------------------------

    protected isInitialized: boolean;

    protected _language: string;
    protected _languages: Map<string, string>;
    protected _defaultLanguage: string = SettingsBaseService.LANGUAGE_EN;

    protected _sid: string;
    protected _apiUrl: string;
    protected _cookieDomain: string;

    protected _assetsUrl: string;
    protected _logoutUrl: string;
    protected _isRunOnServer: boolean;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor() {
        super();
    }

    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public initialize(config: any, routerParams: any): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }

        this.isInitialized = true;

        let params = {};
        _.assign(params, config);
        _.assign(params, this.getParamsFromCookies());
        _.assign(params, routerParams);

        this.parseParams(Object.keys(params), params);
        this.setParamsToCookies();
    }

    public destroy(): void {
        this._languages = null;
    }

    //--------------------------------------------------------------------------
    //
    //	Parse Methods
    //
    //--------------------------------------------------------------------------

    protected getParamsFromCookies(): any {}
    protected setParamsToCookies(): any {}

    protected parseLanguages(value: string): Map<string, string> {
        let map = new Map();
        let items = value.split(SettingsBaseService.LANGUAGE_SEPARATOR);
        for (let item of items) {
            let language = item.split(SettingsBaseService.LANGUAGE_CODE_SEPARATOR);
            if (language.length === 2) {
                map.set(language[0], language[1]);
            }
        }
        return map;
    }

    protected parseLanguage(value: any): string {
        if (_.isNil(value)) {
            return null;
        }

        value = value.toString();
        if (value === SettingsBaseService.LANGUAGE_EN_CODE) {
            return SettingsBaseService.LANGUAGE_EN;
        }
        if (value === SettingsBaseService.LANGUAGE_RU_CODE) {
            return SettingsBaseService.LANGUAGE_RU;
        }
        return value;
    }

    protected parseUrl(value: any): string {
        return UrlUtil.parseUrl(value);
    }

    protected parseBoolean(value: any): boolean {
        return value === 'true' || value === true;
    }

    protected parseParams(keys: Array<string>, params: any): void {
        for (let name of keys) {
            this.parseParam(name, params[name]);
        }
    }

    protected parseParam(name: string, value: any): void {
        let variable = '_' + name;

        switch (name) {
            case 'apiUrl':
            case 'assetsUrl':
                this[variable] = this.parseUrl(value);
                break;

            case 'isRunOnServer':
                this[variable] = this.parseBoolean(value);
                break;

            case 'language':
            case 'defaultLanguage':
                this[variable] = this.parseLanguage(value);
                break;

            case 'languages':
                this._languages = this.parseLanguages(value);
                break;

            default:
                this[variable] = value;
                break;
        }
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get sid(): string {
        return this._sid;
    }
    public get apiUrl(): string {
        return this._apiUrl;
    }
    public get isRunOnServer(): boolean {
        return this._isRunOnServer;
    }
    public get language(): string {
        return this._language;
    }
    public get defaultLanguage(): string {
        return this._defaultLanguage;
    }
    public get assetsUrl(): string {
        return this._assetsUrl;
    }
    public get cookieDomain(): string {
        return this._cookieDomain;
    }
    public get logoutUrl(): string {
        return this._logoutUrl;
    }
    public get languages(): Map<string, string> {
        return this._languages;
    }
}
