import { SequienceExecutor } from '../../../common/executor';
import { PromiseHandler, PromiseReflector } from '../../../common/promise';
import { BtcApiBitcore, IBtcTransactionBitcore } from './BtcApiBitcore';

export class BtcApiBitcoreTransactionsLoader extends SequienceExecutor<Array<string>, Array<IBtcTransactionBitcore | Error>> {
    // --------------------------------------------------------------------------
    //
    //  Constuructor
    //
    // --------------------------------------------------------------------------

    constructor(private api: BtcApiBitcore) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async executeInput(value: Array<string>): Promise<Array<IBtcTransactionBitcore | Error>> {
        let promise = PromiseHandler.create<Array<IBtcTransactionBitcore | Error>>();

        let promises = value.map(id => PromiseReflector.create<IBtcTransactionBitcore, Error>(this.api.getTransaction(id), id));
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
