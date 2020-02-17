import { Method } from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LoadableMapCollection } from '../../../map';
import { ApiResponse } from '../../ApiResponse';
import { HttpApi } from '../HttpApi';

export abstract class HttpApiLoadableMapCollection<U, V> extends LoadableMapCollection<U, ApiResponse<V>> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected api: HttpApi;

    protected requestName: string;
    protected requestMethod: Method;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(api: HttpApi, requestName: string, requestMethod: Method, uidPropertyName: keyof U) {
        super(uidPropertyName);

        this.api = api;
        this.requestName = requestName;
        this.requestMethod = requestMethod;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected makeRequest(): Observable<ApiResponse<V>> {
        return this.api.call({ name: this.requestName, method: this.requestMethod, data: this.getParamsForRequest() });
    }

    protected abstract getParamsForRequest(): any;

    protected parseResponse(response: ApiResponse<V>): void {
        this.parseItems(this.getResponseItems(response));
        this._isAllLoaded = true;
    }

    protected isErrorResponse(response: ApiResponse<V>): boolean {
        return response.isHasError;
    }

    protected parseItems(items: Array<any>): void {
        if (_.isEmpty(items)) {
            return;
        }

        for (let item of items) {
            let value: U = this.parseItem(item);
            if (value) {
                this.add(value);
            }
        }
    }

    protected getResponseItems(response: ApiResponse<V>): Array<any> {
        return response.data as any;
    }

    protected parseErrorResponse(response: ApiResponse<V>): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this.api = null;
    }
}
