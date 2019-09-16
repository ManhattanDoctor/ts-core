import { LocalDataSource } from 'ng2-smart-table';
import { IDestroyable } from '../../../common';
import { IPagination } from '../../../common/dto';
import { ApiResponse } from '../../api';
import { ApiPagedMapCollection } from '../api';
import { TableDataSource } from './TableDataSource';

export class TablePagedDataSource<U> extends TableDataSource<U> implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(map: ApiPagedMapCollection<U, any>) {
        super(map);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected loadingCompleteHandler<T>(response: ApiResponse<IPagination<T>>): void {
        this._count = response.data.total;
        this.promiseResolve(this.map.collection);
        this.destroyPromise();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public setPaging(page: number, perPage: number, doEmit?: boolean): LocalDataSource {
        let map = this.map as ApiPagedMapCollection<U, any>;
        map.pageIndex = Math.max(0, page - 1);
        map.pageSize = Math.max(1, perPage);
        return super.setPaging(page, perPage, doEmit);
    }

    public setPage(page: number, doEmit?: boolean): LocalDataSource {
        let map = this.map as ApiPagedMapCollection<U, any>;
        map.pageIndex = Math.max(0, page - 1);
        return super.setPage(page, doEmit);
    }
}
