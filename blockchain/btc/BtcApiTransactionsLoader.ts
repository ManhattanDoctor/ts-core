import { SequienceExecutor } from '@ts-core/common/executor';
import { PromiseReflector } from '@ts-core/common/promise';
import { BtcApi } from './BtcApi';
import { IBtcTransaction } from './IBtcTransaction';

export class BtcApiTransactionsLoader extends SequienceExecutor<Array<string>, Array<IBtcTransaction | Error>> {
    // --------------------------------------------------------------------------
    //
    //  Constuructor
    //
    // --------------------------------------------------------------------------

    constructor(private api: BtcApi) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async executeInput(value: Array<string>): Promise<Array<IBtcTransaction | Error>> {
        let promises = value.map(id => PromiseReflector.create<IBtcTransaction, Error>(this.api.getTransaction(id)));
        return (await Promise.all(promises)).map(item => (item.isComplete ? item.value : item.error));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this.api = null;
    }
}
