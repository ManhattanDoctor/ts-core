import { plainToClass } from 'class-transformer';
import { SmartTableFilterableMapCollection } from '../../../../../../packages/frontend-angular/src/component/smart-table/SmartTableFilterableMapCollection';
import { TransportHttp } from '../../../../../../packages/common/transport/http/TransportHttp';
import { TransportHttpCommandAsync } from '../../../../../../packages/common/transport/http/TransportHttpCommandAsync';

export class CoinMapCollection extends SmartTableFilterableMapCollection<Coin, Array<any>> {
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

    protected request(): Promise<Array<any>> {
        return this.transport.sendListen(new TransportHttpCommandAsync(`coin`, { data: this.createRequestData() }));
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------

    protected parseItem(item: any): Coin {
        return plainToClass(Coin, item);
    }
}

export class Coin {
    public name: string;
    public coinId: string;
    public decimal: number;
    public status: string;
    public type: string;
}
