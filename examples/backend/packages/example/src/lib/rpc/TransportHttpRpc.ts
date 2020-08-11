import * as _ from 'lodash';
import { TransportHttp, ITransportHttpRequest } from '@ts-core/common/transport/http';
import { ObjectUtil, TransformUtil } from '@ts-core/common/util';
import { ExtendedError } from '@ts-core/common/error';
import { ITransportCommand, ITransportCommandOptions } from '@ts-core/common/transport';

export class TransportHttpRpc extends TransportHttp {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static isRpcError(data: any): boolean {
        return ObjectUtil.instanceOf<ITransportHttpRpcResponse>(data, ['id', 'result', 'error']) ? !_.isNil(data.error) : false;
    }

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    protected isError(data: any): boolean {
        return TransportHttpRpc.isRpcError(data) || super.isError(data);
    }

    protected parseError<U>(data: any, command: ITransportCommand<U>): ExtendedError {
        return TransportHttpRpc.isRpcError(data) ? this.parseRpcError(data, command) : super.parseError(data, command);
    }

    protected parseRpcError<U, V>(data: ITransportHttpRpcResponse, command: ITransportCommand<U>): ExtendedError {
        if (_.isNumber(data.error)) {
            return new ExtendedError('Unknown error', data.error);
        }
        if (ExtendedError.instanceOf(data.error)) {
            return ExtendedError.create(data.error);
        }
        return new ExtendedError(`Unknown RPC error`, ExtendedError.DEFAULT_ERROR_CODE, data);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected prepareCommand<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): void {
        if (_.isNil(this.settings) || _.isNil(this.settings.baseURL)) {
            throw new ExtendedError(`Settings url is undefined`);
        }

        let request = command.request as ITransportHttpRequest;
        if (_.isNil(request.url)) {
            request.url = this.settings.baseURL;
        }

        request.method = 'post';
        request.data = {
            id: command.id,
            method: command.name,
            params: [command.request]
        };
        super.prepareCommand(command, options);
    }
}

export class ITransportHttpRpcRequest {
    id: string;
    method: string;
    params: Array<any>;
}

export class ITransportHttpRpcResponse<V = any> {
    id: string;
    error: number | ExtendedError;
    result: V;
}
