import { Observable } from 'rxjs';
import { IDestroyable } from '../../../common';
import { LoadableMapCollection } from '../../../common/map';
import { ApiMethod, ApiResponse } from '../../api';
import { ApiServiceBase } from '../../api/ApiServiceBase';

export abstract class ApiBaseLoadableMapCollection<U, V> extends LoadableMapCollection<U, ApiResponse<V>> {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    protected api: ApiServiceBase;

    protected requestName: string;
    protected requestMethod: ApiMethod;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    protected constructor(api: ApiServiceBase, requestName?: string, requestMethod?: ApiMethod, uidPropertyName?: keyof U) {
        super(uidPropertyName);

        this.api = api;
        this.requestName = requestName;
        this.requestMethod = requestMethod;
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected makeRequest(): Observable<ApiResponse<V>> {
        return this.api.call({ name: this.requestName, method: this.requestMethod, data: this.getParamsForRequest() });
    }

    protected parseResponse(response: ApiResponse<V>): void {
        let items = this.getResponseItems(response);
        this.parseItems(items);
        this._isAllLoaded = true;
    }

    protected isErrorResponse(response: ApiResponse<V>): boolean {
        return response.isHandleError;
    }

    protected parseItems(items: Array<any>): void {
        if (!items || items.length === 0) {
            return;
        }

        for (let item of items) {
            let value: U = this.parseItem(item);
            if (value) {
                this.add(value);
            }
        }
    }

    protected getParamsForRequest(): any {
        return {};
    }

    protected getResponseItems(response: ApiResponse<V>): Array<any> {
        return response.data as any;
    }
    protected parseErrorResponse(response: ApiResponse<V>): void {}

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this.api = null;
    }
}
