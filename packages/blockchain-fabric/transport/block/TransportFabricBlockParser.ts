import { Block, BlockData } from 'fabric-client';
import { ITransportFabricBlock } from './ITransportFabricBlock';
import * as _ from 'lodash';
import { ITransportFabricTransaction } from './ITransportFabricTransaction';
import { TransportFabric } from '../TransportFabric';
import { TransformUtil } from '@ts-core/common/util';
import { IFabricBlock } from '../../api';

export class TransportFabricBlockParser {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public parse(block: IFabricBlock): ITransportFabricBlock {
        let item: ITransportFabricBlock = {} as any;
        item.hash = block.hash;
        item.number = block.number;
        item.createdDate = block.createdDate;
        if (_.isNil(block.data) || _.isEmpty(block.data.data)) {
            return;
        }

        let transactions: Array<ITransportFabricTransaction> = [];
        for (let data of block.data.data) {
            transactions.push(this.parseTransaction(data));
        }
        item.transactions = _.compact(transactions);
        return item;
    }

    public parseTransaction(data: BlockData): ITransportFabricTransaction {
        return this.parseBlockData(data);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private parseBlockData(data: BlockData): ITransportFabricTransaction {
        if (_.isNil(data) || _.isNil(data.payload) || _.isNil(data.payload.header) || _.isNil(data.payload.header.channel_header)) {
            return null;
        }

        let header = data.payload.header.channel_header;

        let item: ITransportFabricTransaction = {} as any;
        item.id = header.tx_id;
        item.timestamp = header.timestamp;
        item.channelId = header.channel_id;

        if (!_.isNil(data.payload.data) && !_.isEmpty(data.payload.data.actions)) {
            for (let action of data.payload.data.actions) {
                this.parseBlockAction(item, action);
            }
        }
        return item;
    }

    private parseBlockAction(transaction: ITransportFabricTransaction, action: any): void {
        if (
            _.isNil(action.payload) ||
            _.isNil(action.payload.chaincode_proposal_payload) ||
            _.isNil(action.payload.chaincode_proposal_payload.input) ||
            _.isNil(action.payload.chaincode_proposal_payload.input.chaincode_spec)
        ) {
            return;
        }

        let chaincode = action.payload.chaincode_proposal_payload.input.chaincode_spec;
        if (_.isNil(chaincode.input) || _.isEmpty(chaincode.input.args) || chaincode.input.args.length !== 2) {
            return;
        }
        let method = chaincode.input.args[0].toString();
        if (method !== TransportFabric.chaincodeMethod) {
            return;
        }

        transaction.request = TransformUtil.toJSON(chaincode.input.args[1].toString());
        transaction.chaincode = chaincode.chaincode_id;

        if (
            _.isNil(action.payload.action) ||
            _.isNil(action.payload.action.proposal_response_payload) ||
            _.isNil(action.payload.action.proposal_response_payload.extension)
        ) {
            return;
        }

        let extension = action.payload.action.proposal_response_payload.extension;
        if (!_.isNil(extension.chaincode_id)) {
            transaction.chaincode = extension.chaincode_id;
        }

        let response = extension.response;
        if (_.isNil(response) || _.isNil(response.payload)) {
            return;
        }
        transaction.response = TransformUtil.toJSON(response.payload);
    }
}
