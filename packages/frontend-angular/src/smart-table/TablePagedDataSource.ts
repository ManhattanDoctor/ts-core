import { IDestroyable } from '@ts-core/common';
import { ApiResponse } from '@ts-core/common/api';
import { IPagination } from '@ts-core/common/dto';
import { ObjectUtil } from '@ts-core/common/util';
import { LocalDataSource } from 'ng2-smart-table';
import { TableDataSource } from './TableDataSource';

export class TablePagedDataSource<U> extends TableDataSource<U> implements IDestroyable {
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
        let map = this.map as any;
        if (ObjectUtil.instanceOf(map, ['pageIndex', 'pageSize'])) {
            map.pageIndex = Math.max(0, page - 1);
            map.pageSize = Math.max(1, perPage);
        }
        return super.setPaging(page, perPage, doEmit);
    }

    public setPage(page: number, doEmit?: boolean): LocalDataSource {
        let map = this.map as any;
        if (ObjectUtil.instanceOf(map, ['pageIndex'])) {
            map.pageIndex = Math.max(0, page - 1);
        }
        return super.setPage(page, doEmit);
    }
}
