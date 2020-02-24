import { AxiosError } from 'axios';
import * as _ from 'lodash';
import { ExtendedError } from '../../../common/error';
import { ITransportCommand, TransportCommandAsync } from '../../../common/transport';
import { TransportNoConnectionError, TransportTimeoutError } from '../../../common/transport/error';
import { TransformUtil } from '../../util';
import { ITransportHttpRequest } from './ITransportHttpRequest';
import { ITransportResponse } from '../ITransportResponse';

// V is first for convenience
export class TransportHttpCommandAsync<V, U = any> extends TransportCommandAsync<ITransportHttpRequest<U>, V> implements ITransportResponse<V> {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static isError(data: any): boolean {
        return data instanceof ExtendedError || ExtendedError.instanceOf(data) || TransportHttpCommandAsync.isAxiosError(data);
    }

    public static isAxiosError(data: any): boolean {
        if (!_.isNil(data)) {
            return _.isBoolean(data.isAxiosError) ? data.isAxiosError : false;
        }
        return false;
    }

    public static createAxiosError<U>(data: AxiosError, command?: ITransportCommand<U>): ExtendedError {
        let message = data.message ? data.message.toLocaleLowerCase() : ``;
        if (message.includes(`network error`)) {
            return new TransportNoConnectionError(command);
        }
        if (message.includes(`timeout of`)) {
            return new TransportTimeoutError(command);
        }

        let response = data.response;

        if (!_.isNil(response)) {
            if (ExtendedError.instanceOf(response.data)) {
                return TransformUtil.toClass(ExtendedError, response.data);
            } else {
                return new ExtendedError(response.statusText, response.status, response.data);
            }
        }

        return new ExtendedError(`Unknown axios error`, ExtendedError.DEFAULT_ERROR_CODE, data);
    }

    public static createError<U>(data: any, command?: ITransportCommand<U>): ExtendedError {
        if (data instanceof ExtendedError) {
            return data;
        }
        if (ExtendedError.instanceOf(data)) {
            return TransformUtil.toClass(ExtendedError, data);
        }
        if (TransportHttpCommandAsync.isAxiosError(data)) {
            return this.createAxiosError(data, command);
        }
        return new ExtendedError(`Unknown error`, ExtendedError.DEFAULT_ERROR_CODE, data);
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(path: string, request?: ITransportHttpRequest<U>) {
        super(path, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateResponse(value: V | Error | ExtendedError): V {
        if (TransportHttpCommandAsync.isError(value)) {
            throw TransportHttpCommandAsync.createError(value);
        }
        return super.validateResponse(value);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isHandleError(): boolean {
        return this.request ? this.request.isHandleError : false;
    }

    public get isHandleLoading(): boolean {
        return this.request ? this.request.isHandleLoading : false;
    }
}
