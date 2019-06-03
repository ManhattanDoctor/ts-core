import * as _ from 'lodash';
import { ObjectUtil } from '../../common/util/ObjectUtil';

export abstract class AbstractSettingsStorage {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    private static parseValue<T = any>(value: any, defaultValue: T): T {
        if (_.isNumber(defaultValue)) {
            return parseFloat(value) as any;
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected data: any;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(data?: any) {
        this.data = data;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected getValue<T>(name: string, defaultValue?: T): T {
        let value = process.env[name] as any;
        if (!_.isNil(value)) {
            return AbstractSettingsStorage.parseValue(value, defaultValue);
        }

        if (!ObjectUtil.hasOwnProperty(this.data, name)) {
            return defaultValue;
        }

        value = this.data[name];
        if (_.isNil(value)) {
            return defaultValue;
        }

        return AbstractSettingsStorage.parseValue(value, defaultValue);
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected initializedHandler(): void {}

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isTesting(): boolean {
        return this.getValue('NODE_ENV') === 'testing';
    }

    public get isProduction(): boolean {
        return this.getValue('NODE_ENV') === 'production';
    }

    public get isDevelopment(): boolean {
        return this.getValue('NODE_ENV') === 'development';
    }
}
