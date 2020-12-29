import * as _ from 'lodash';
import { ILogger } from '../logger';
import { ObjectUtil } from '../util';

export abstract class AbstractSettingsStorage {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseBoolean(value: any): boolean {
        return value === true || value === 'true' || value === 'TRUE' || value === 1 || value === '1';
    }

    public static parsePEM(value: string): string {
        return _.isString(value) ? value.replace(/\\n/gm, '\n') : value;
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
        return this.parseValue(value, defaultValue);
    }

    protected getPrefferedValue<T>(name: string): T {
        return null;
    }

    protected parseValue<T>(value: any, defaultValue: T): T {
        if (!_.isNil(value) && _.isNumber(defaultValue)) {
            return parseFloat(value.toString()) as any;
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected initializedHandler(): void {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async validate(logger: ILogger): Promise<boolean> {
        return true;
    }
}
