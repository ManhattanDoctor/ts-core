import { ApiRequest } from '@ts-core/common/api';
import { HttpApi } from '@ts-core/common/api/http';
import { Method } from 'axios';
import * as _ from 'lodash';

export class ApiService extends HttpApi {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public xToken: string;

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected createParamsForRequest(request: ApiRequest, method: Method): any {
        let params = request.data ? JSON.parse(JSON.stringify(request.data)) : {};
        if (!_.isNil(this.locale)) {
            params.locale = this.locale;
        }
        return params;
    }

    protected createUrlForRequest(request: ApiRequest): string {
        return this.url + request.config.name;
    }

    protected createHeadersForRequest(request: ApiRequest, method: Method, params: any): any {
        let value = super.createHeadersForRequest(request, method, params);
        if (!_.isNil(this.sid)) {
            value['Authorization'] = `Bearer ${this.sid}`;
        }
        if (!_.isNil(this.xToken)) {
            value['x-token'] = this.xToken;
        }
        return value;
    }
}
