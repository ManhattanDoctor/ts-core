import { IListDtoResponse } from '@sdex/gate-common/api/command/coin/IListDtoResponse';
import { TransportCommandAsync } from '@ts-core/common/transport';
import { ServiceName } from '../../IService';
import { ITraceable } from '@ts-core/common/trace';

export class TestCommand extends TransportCommandAsync<ITraceable, IListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = ServiceName.COIN + '.CoinListCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ITraceable) {
        super(CoinListCommand.NAME, request);
    }
}
