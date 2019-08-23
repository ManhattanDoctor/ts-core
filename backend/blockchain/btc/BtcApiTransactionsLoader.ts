import { SequienceExecutor } from '../../../common/executor';
import { PromiseHandler, PromiseReflector } from '../../../common/promise';
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
        let promise = PromiseHandler.create<Array<IBtcTransaction | Error>>();

        let promises = value.map(id => PromiseReflector.create<IBtcTransaction, Error>(this.api.getTransaction(id), id));
        Promise.all(promises).then(items => {
            promise.resolve(items.map(item => (item.isComplete ? item.value : item.error)));
        });

        return promise.promise;
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
