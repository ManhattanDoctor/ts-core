import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';
import * as _ from 'lodash';
import { ExtendedError } from '../error';

export class ValidateUtil {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public static validate<T = any>(item: T, isNeedThrowError: boolean = true, options?: ValidatorOptions): Array<ValidationError> {
        if (_.isNil(item) || !_.isObject(item)) {
            return [];
        }
        let errors = validateSync(item, options);
        if (isNeedThrowError && !_.isEmpty(errors)) {
            throw new ExtendedError(`Validation failed`, null, errors);
        }
        return errors;
    }

    public static async validateAsync<T = any>(item: T, isNeedThrowError: boolean = true, options?: ValidatorOptions): Promise<Array<ValidationError>> {
        if (_.isNil(item) || !_.isObject(item)) {
            return [];
        }
        let errors = await validate(item, options);
        if (isNeedThrowError && !_.isEmpty(errors)) {
            throw new ExtendedError(`Validation failed`, null, errors);
        }
        return errors;
    }

    public static isValid<T = any>(item: T, isNeedThrowError: boolean = true, options?: ValidatorOptions): boolean {
        return _.isEmpty(this.validate(item, isNeedThrowError, options));
    }

    public static async isValidAsync<T = any>(item: T, isNeedThrowError: boolean = true, options?: ValidatorOptions): Promise<boolean> {
        return _.isEmpty(await this.validateAsync(item, isNeedThrowError, options));
    }

    public static toString(items: Array<ValidationError>): string {
        if (!_.isArray(items) || _.isEmpty(items)) {
            return `Validation failed`;
        }

        let value = ``;
        for (let item of items) {
            if (item instanceof ValidationError) {
                value += `${item.toString()}\n`;
            }
        }
        return value.trim();
    }
}
