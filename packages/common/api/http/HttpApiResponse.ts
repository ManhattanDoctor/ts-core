import * as _ from 'lodash';
import { ObjectUtil } from '../../util';
import { ApiError } from '../ApiError';
import { ApiResponse } from '../ApiResponse';
import { HttpApiError } from './HttpApiError';

export class HttpApiResponse<T> extends ApiResponse<T> {
    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    protected isErrorData(data: any): boolean {
        if (ObjectUtil.hasOwnProperty(data, `isError`) && _.isBoolean(data.isError)) {
            return data.isError;
        }
        return super.isErrorData(data);
    }

    protected createError(data: any, language?: string): ApiError {
        return HttpApiError.create(data, language);
    }
}
