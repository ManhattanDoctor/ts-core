import * as _ from 'lodash';
import { SequienceExecutor } from '../../../common/executor';
import { PromiseReflector } from '../../../common/promise';
import { ObjectUtil } from '../../../common/util';
import { BtcApi } from './BtcApi';
import { IBtcInput } from './IBtcInput';

export class BtcApiInputsTransactionLoader extends SequienceExecutor<Array<IBtcInput>, void> {
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
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getInputUnuqId(input: IBtcInput): string {
        return input.tx + '_' + input.vout;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async executeInput(inputs: Array<IBtcInput>): Promise<void> {
        let ids: Array<string> = _.uniq(_.compact(inputs.map(input => input.txid)));

        let promises = ids.map(id => PromiseReflector.create(this.api.getTransaction(id), id));
        for (let item of await Promise.all(promises)) {
            if (item.isError) {
                throw item.error;
            }

            for (let input of inputs) {
                if (input.txid !== item.value.txid) {
                    continue;
                }
                let transaction = (input.tx = _.cloneDeep(item.value));
                transaction.vout = transaction.vout.filter(output => output.n === input.vout);

                if (transaction.vout.length === 0) {
                    console.log(input);
                    process.exit();
                }

                ObjectUtil.clear(transaction, ['txid', 'vout']);
            }
        }
        this.api.debug(`${this.progress.toFixed(1)}% of transactions loaded`);
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
