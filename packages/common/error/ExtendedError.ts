import { Exclude, Transform } from 'class-transformer';
import * as _ from 'lodash';
import { ObjectUtil, TransformUtil } from '../util';

export class ExtendedError<T = any> extends Error implements Error {
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
        if (error instanceof ExtendedError) {
            return error;
        }

        if (!(error instanceof Error)) {
            throw new ExtendedError(`Object isn't instance of error`);
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

    @Exclude({ toPlainOnly: true })
    public stack: string;

    @Transform(TransformUtil.toJSON, { toClassOnly: true })
    @Transform(TransformUtil.fromJSON, { toPlainOnly: true })
    public details: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(message: string, code: number = null, details: T = null, isFatal: boolean = true) {
        super(message);
        if (!_.isNumber(code)) {
            code = ExtendedError.DEFAULT_ERROR_CODE;
        }

        Object.defineProperty(this, 'stack', { enumerable: true, writable: true });
        Object.defineProperty(this, 'message', { enumerable: true, writable: true });

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
}
