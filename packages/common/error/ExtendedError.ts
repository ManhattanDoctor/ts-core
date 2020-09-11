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

    public static HTTP_CODE_BAD_REQUEST = 400;
    public static HTTP_CODE_UNAUTHORIZED = 401;
    public static HTTP_CODE_PAYMENT_REQUIRED = 402;
    public static HTTP_CODE_FORBIDDEN = 403;
    public static HTTP_CODE_NOT_FOUND = 404;
    public static HTTP_CODE_METHOD_NOT_ALLOWED = 405;
    public static HTTP_CODE_ACCEPTABLE = 406;
    public static HTTP_CODE_PROXY_AUTHENTICATION_REQUIRED = 407;
    public static HTTP_CODE_REQUEST_TIMEOUT = 408;
    public static HTTP_CODE_CONFLICT = 409;
    public static HTTP_CODE_GONE = 410;
    public static HTTP_CODE_LENGTH_REQUIRED = 411;
    public static HTTP_CODE_PRECONDITION_FAILED = 412;
    public static HTTP_CODE_PAYLOAD_TOO_LARGE = 413;
    public static HTTP_CODE_URI_TOO_LONG = 414;
    public static HTTP_CODE_UNSUPPORTED_MEDIA_TYPE = 415;
    public static HTTP_CODE_REQUESTED_RANGE_NOT_SATISFIABLE = 416;
    public static HTTP_CODE_EXPECTATION_FAILED = 417;
    public static HTTP_CODE_I_AM_A_TEAPOT = 418;
    public static HTTP_CODE_UNPROCESSABLE_ENTITY = 422;
    public static HTTP_CODE_FAILED_DEPENDENCY = 424;
    public static HTTP_CODE_TOO_MANY_REQUESTS = 429;
    public static HTTP_CODE_INTERNAL_SERVER_ERROR = 500;
    public static HTTP_CODE_NOT_IMPLEMENTED = 501;
    public static HTTP_CODE_BAD_GATEWAY = 502;
    public static HTTP_CODE_SERVICE_UNAVAILABLE = 503;
    public static HTTP_CODE_GATEWAY_TIMEOUT = 504;
    public static HTTP_CODE_HTTP_VERSION_NOT_SUPPORTED = 505;

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
        return ObjectUtil.instanceOf<ExtendedError>(data, ['code', 'message', 'details']);
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
