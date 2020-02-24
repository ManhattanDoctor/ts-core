import { IPagination } from '@ts-core/common/dto';
import { plainToClass } from 'class-transformer';
import { TransportHttp } from '@ts-core/common/transport/http';
import { TransportHttpCommandAsync } from '@ts-core/common/transport/http';
import { SmartTablePaginableMapCollection } from '@ts-core/frontend-angular';

export class CoinBlockMapCollection extends SmartTablePaginableMapCollection<CoinBlock, any> {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(protected transport: TransportHttp) {
        super('coinId');
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected request(): Promise<IPagination<any>> {
        return this.transport.sendListen(new TransportHttpCommandAsync(`coin/block`, { data: this.createRequestData() }));
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    protected parseItem(item: any): CoinBlock {
        return plainToClass(CoinBlock, item);
    }
}

export class CoinBlock {
    coinId: string;
    parsedDate: Date;
    createdDate: Date;
    addresses: number;
    blockHeight: number;
    transactions: number;
}
