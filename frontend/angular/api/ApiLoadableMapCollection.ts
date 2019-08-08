import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LoadableMapCollection } from '../../../common/map';
import { ApiMethod, ApiResponse } from '../../api';
import { ApiBaseService } from '../../api/ApiBaseService';

export abstract class ApiLoadableMapCollection<U, V> extends LoadableMapCollection<U, ApiResponse<V>> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected api: ApiBaseService;

    protected requestName: string;
    protected requestMethod: ApiMethod;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(api: ApiBaseService, requestName: string, requestMethod: ApiMethod, uidPropertyName: keyof U) {
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

    protected parseResponse(response: ApiResponse<V>): void {
        let items = this.getResponseItems(response);
        this.parseItems(items);
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

    protected getParamsForRequest(): any {
        return {};
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
