import * as _ from 'lodash';
import { ObjectUtil } from '../util';

export abstract class AbstractSettingsStorage {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    private static parseValue<T>(value: any, defaultValue: T): T {
        if (!_.isNil(value) && _.isNumber(defaultValue)) {
            return parseFloat(value.toString()) as any;
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
        this.data = data || {};
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected getValue<T>(name: string, defaultValue?: T): T {
        let value = this.getPrefferedValue(name);
        if (_.isNil(value) && ObjectUtil.hasOwnProperty(this.data, name)) {
            value = this.data[name];
        }

        if (_.isNil(value)) {
            value = defaultValue;
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
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected getPrefferedValue<T>(name: string): T {
        return null;
    }
}
