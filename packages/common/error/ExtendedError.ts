import { Exclude, Transform } from 'class-transformer';
import * as _ from 'lodash';
import { ObjectUtil } from '../util';

export class ExtendedError<T = any> implements Error {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_ERROR_CODE = -1000;

    // --------------------------------------------------------------------------
    //
    //  Public Static
    //
    // --------------------------------------------------------------------------

    public static create(error: Error | ExtendedError, code?: number): ExtendedError {
        if (!(error instanceof Error)) {
            throw new ExtendedError(`Is not instance of error`);
        }

        if (error instanceof ExtendedError) {
            return error;
        }

        let message = error.message;
        if (error.name) {
            message = `[${error.name}'] ${message}`;
        }

        return new ExtendedError(message, _.isNil(code) ? ExtendedError.DEFAULT_ERROR_CODE : code, error.stack);
    }

    public static instanceOf(data: any): boolean {
        return ObjectUtil.instanceOf(data, ['code', 'message', 'details', 'isFatal']);
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public code: number;
    public message: string;
    public isFatal: boolean;

    @Transform(value => (_.isObject(value) ? JSON.stringify(value) : value), { toPlainOnly: true })
    @Transform(value => (ObjectUtil.isJSON(value) ? JSON.parse(value) : value), { toClassOnly: true })
    public details: any;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(message: string, code: number = null, details: T = null, isFatal: boolean = true) {
        if (!_.isNumber(code)) {
            code = ExtendedError.DEFAULT_ERROR_CODE;
        }

        this.code = code;
        this.message = message;
        this.details = details;
        this.isFatal = _.isBoolean(isFatal) ? isFatal : true;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public deserialize(data: any): void {
        this.code = data.code;
        this.message = data.message;
        this.isFatal = data.isFatal;
    }

    public toString(): string {
        let value = this.message;
        if (_.isNumber(this.code)) {
            value += ` (${this.code})`;
        }
        if (this.details) {
            value += `\n${this.details}`;
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    public get name(): string {
        return this.code.toString();
    }
}
