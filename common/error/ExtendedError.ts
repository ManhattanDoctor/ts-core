import * as _ from 'lodash';

export class ExtendedError<T = any> extends Error {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_ERROR_CODE = -1;

    // --------------------------------------------------------------------------
    //
    //  Public Static
    //
    // --------------------------------------------------------------------------

    public static create(error: Error, code: number = -1): ExtendedError {
        let message = error.message;
        if (error.name) {
            message = '[' + error.name + '] ' + message;
        }
        return new ExtendedError(message, code, error.stack);
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public code: number;
    public message: string;
    public details: any;
    public isFatal: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(message: string, code: number = null, details: T = null, isFatal: boolean = true) {
        super();

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
