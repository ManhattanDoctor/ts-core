import { Block, BlockData } from 'fabric-client';
import { ITransportFabricBlock } from './ITransportFabricBlock';
import * as _ from 'lodash';
import { ITransportFabricTransaction } from './ITransportFabricTransaction';
import { TransportFabric } from '../TransportFabric';
import { TransformUtil } from '@ts-core/common/util';
import { IFabricBlock, FabricTransactionValidationCode, IFabricTransaction } from '../../api';

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

        let metadata = block.metadata.metadata;
        let validationCodes = _.isArray(metadata) && !_.isEmpty(metadata) ? metadata[metadata.length - 1] : [];

        let transactions = [];
        for (let i = 0; i < block.data.data.length; i++) {
            let item = this.parseBlockData(block.data.data[i]);
            if (_.isNil(item)) {
                continue;
            }
            item.validationCode = validationCodes[i];
            transactions.push(item);
        }
        item.transactions = transactions;

        let events = [];
        item.events = events;

        return item;
    }

    public parseTransaction(data: IFabricTransaction): ITransportFabricTransaction {
        let item = this.parseBlockData(data.transactionEnvelope);
        item.validationCode = data.validationCode;
        return item;
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
        item.hash = header.tx_id;
        item.channel = header.channel_id;
        item.createdDate = new Date(header.timestamp);

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
