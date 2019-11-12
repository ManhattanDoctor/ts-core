import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/internal/operators';
import { ExtendedError } from '../../../common/error';
import { ApiBaseService } from '../../api/ApiBaseService';
import { ApiError } from '../../api/ApiError';
import { ApiMethod } from '../../api/ApiMethod';
import { ApiRequest } from '../../api/ApiRequest';
import { ApiResponse } from '../../api/ApiResponse';

export abstract class HttpApiService extends ApiBaseService {

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected http: HttpClient) {
        super();
        this.idleTimeout = 2 * ApiBaseService.IDLE_TIMEOUT;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected makeRequest(url: string, method: ApiMethod, params: HttpParams, headers: HttpHeaders, idleTimeout: number, responseType: any): Observable<any> {
        let observable: Observable<any> = null;
        switch (method) {
            case ApiMethod.GET:
                observable = this.http.get(url, { headers, params, responseType });
                break;
            case ApiMethod.POST:
                observable = this.http.post(url, params, { headers, responseType });
                break;
            case ApiMethod.PUT:
                observable = this.http.put(url, params, { headers, responseType });
                break;
            case ApiMethod.DELETE:
                observable = this.http.delete(url, { headers, responseType });
                break;
        }

        if (!observable) {
            throw new ExtendedError('Method is undefined');
        }
        return observable.pipe(timeout(idleTimeout));
    }

    protected createHeadersForRequest(request: ApiRequest, method: ApiMethod, body: HttpParams): HttpHeaders {
        return new HttpHeaders();
    }

    protected parseResponse<T>(data: any, request: ApiRequest): ApiResponse<T> {
        return new ApiResponse(data, request);
    }

    protected parseErrorResponse<T>(error: HttpErrorResponse, request: ApiRequest): ApiResponse<T> {
        return this.parseResponse(new ApiError(error), request);
    }
}
