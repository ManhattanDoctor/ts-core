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

    public static create(item: Error | ExtendedError, code?: number): ExtendedError {
        if (item instanceof ExtendedError) {
            return item;
        }

        if (_.isNil(code) && ObjectUtil.hasOwnProperty(item, 'code')) {
            code = item['code'];
        }

        let message = item.message;
        if (!_.isEmpty(item.name)) {
            message = `[${item.name}'] ${message}`;
        }

        return new ExtendedError(message, !_.isNil(code) ? code : ExtendedError.DEFAULT_ERROR_CODE, item.stack);
    }

    public static instanceOf(data: any): data is ExtendedError {
        return ObjectUtil.instanceOf<ExtendedError>(data, ['code', 'message', 'details', 'isFatal']);
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
