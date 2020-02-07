import { EthApi } from '../packages/blockchain/eth';
import { BtcApi } from '../packages/blockchain/btc';



( async() => {
    let btc = new BtcApi({endpoint: 'http://rpcu1:tgvEuAIdZ5pR@217.29.56.145:8332'});
    let eth = new EthApi({endpoint: 'http://217.29.56.143:8547'});
    console.log(await eth.getBlockNumber());
})();



