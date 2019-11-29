import * as spinner from 'cli-spinner';
import * as _ from 'lodash';
import { SequienceExecutor } from '../../../common/executor';
import { PromiseReflector } from '../../../common/promise';
import { ObjectUtil } from '../../../common/util';
import { BtcApi } from './BtcApi';
import { IBtcInput } from './IBtcInput';

export class BtcApiInputsTransactionLoader extends SequienceExecutor<Array<IBtcInput>, void> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private preloader: any;

    // --------------------------------------------------------------------------
    //
    //  Constuructor
    //
    // --------------------------------------------------------------------------

    constructor(private api: BtcApi, isNeedPreloader?: boolean) {
        super();
        if (!isNeedPreloader) {
            return;
        }
        this.preloader = new spinner.Spinner();
        this.preloader.setSpinnerString(18);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async executeInput(inputs: Array<IBtcInput>): Promise<void> {
        let ids: Array<string> = _.uniq(_.compact(inputs.map(input => input.txid)));

        let promises = ids.map(id => PromiseReflector.create(this.api.getTransaction(id)));
        for (let promise of promises) {
            let item = await promise;
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
                    console.error(`Input has zero vout: ${input}`);
                }

                ObjectUtil.clear(transaction, ['txid', 'vout']);
            }
        }
        this.showProgress();
    }

    private showProgress(): void {
        if (!this.preloader) {
            return;
        }

        if (!this.preloader.isSpinning()) {
            this.preloader.start();
        }
        this.preloader.setSpinnerTitle(`${this.totalIndex} / ${this.totalLength} (${this.progress.toFixed(1)}%) inputs loaded`);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();

        if (this.preloader) {
            this.preloader.stop(true);
            this.preloader = null;
        }

        this.api = null;
    }
}
