import * as _ from 'lodash';
import { IPageBookmark, IPaginationBookmark, IPaginableBookmark } from '../../dto';
import { FilterableDataSourceMapCollection } from './FilterableDataSourceMapCollection';

export abstract class PaginableBookmarkDataSourceMapCollection<U, V> extends FilterableDataSourceMapCollection<U, IPaginationBookmark<V>>
    implements IPageBookmark {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _details: Array<keyof U>;
    protected _pageSize: number = 10;
    protected _pageBookmark: string;

    public isClearAfterLoad: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public reload(): Promise<void> {
        this._pageBookmark = null;
        return super.reload();
    }

    public destroy(): void {
        super.destroy();
        this._pageSize = null;
        this._pageBookmark = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected createRequestData(): IPaginableBookmark<U> {
        let params: IPaginableBookmark<U> = super.createRequestData() as any;
        params.pageBookmark = this.pageBookmark;
        params.pageSize = this.pageSize;
        return params;
    }

    protected parseResponse(response: IPaginationBookmark<V>): void {
        this._pageSize = response.pageSize;
        this._pageBookmark = response.pageBookmark;
        super.parseResponse(response);
    }

    protected getResponseItems(response: IPaginationBookmark<V>): Array<V> {
        return !_.isNil(response) ? response.items : null;
    }

    protected isAbleToLoad(): boolean {
        return !this.isLoading && !this.isAllLoaded;
    }

    protected checkIsAllLoaded(response: IPaginationBookmark<V>, items: Array<any>): void {
        this._isAllLoaded = this.isAllLoaded || this.pageSize > items.length;
    }

    protected isNeedClearAfterLoad(response: IPaginationBookmark<V>): boolean {
        return this.isReloadRequest;
    }

    protected commitDetailsProperties(): void {}

    protected commitPageSizeProperties(): void {}

    protected commitPageBookmarkProperties(): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get pageSize(): number {
        return this._pageSize;
    }
    public set pageSize(value: number) {
        if (value === this._pageSize || !_.isNumber(value)) {
            return;
        }
        this._pageSize = value;
        this.commitPageSizeProperties();
    }

    public get pageBookmark(): string {
        return this._pageBookmark;
    }
    public set pageBookmark(value: string) {
        if (value === this._pageBookmark || !_.isString(value)) {
            return;
        }
        this._pageBookmark = value;
        this.commitPageBookmarkProperties();
    }

    public get details(): Array<keyof U> {
        return this._details;
    }
    public set details(value: Array<keyof U>) {
        if (value === this._details || !_.isArray(value)) {
            return;
        }
        this._details = value;
        this.commitDetailsProperties();
    }
}
