import { BlockData } from 'fabric-client';
import { ITransportFabricBlock } from './ITransportFabricBlock';
import * as _ from 'lodash';
import { ITransportFabricTransaction } from './ITransportFabricTransaction';
import { TransportFabric } from '../TransportFabric';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { IFabricBlock, IFabricTransaction } from '../../api';
import { ITransportFabricEvent } from './ITransportFabricEvent';

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

        let events = (item.events = []);
        let transactions = (item.transactions = []);
        if (_.isNil(block.data) || _.isEmpty(block.data.data)) {
            return;
        }

        let metadata = block.metadata.metadata;
        let validationCodes = _.isArray(metadata) && !_.isEmpty(metadata) ? metadata[metadata.length - 1] : [];

        for (let i = 0; i < block.data.data.length; i++) {
            let transaction = this.parseTransactionBlockData(block.data.data[i]);
            if (!_.isNil(transaction)) {
                transaction.validationCode = validationCodes[i];
                transactions.push(transaction);
            }
            let event = this.parseEventBlockData(block.data.data[i]);
            if (!_.isEmpty(event)) {
                events.push(...event);
            }
        }

        return item;
    }

    public parseTransaction(data: IFabricTransaction): ITransportFabricTransaction {
        let item = this.parseTransactionBlockData(data.transactionEnvelope);
        item.validationCode = data.validationCode;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Transaction Methods
    //
    // --------------------------------------------------------------------------

    private parseTransactionBlockData(data: BlockData): ITransportFabricTransaction {
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
                this.parseTransactionBlockAction(item, action);
            }
        }
        return item;
    }

    private parseTransactionBlockAction(transaction: ITransportFabricTransaction, action: any): void {
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

    // --------------------------------------------------------------------------
    //
    //  Event Methods
    //
    // --------------------------------------------------------------------------

    private parseEventBlockData(data: BlockData): Array<ITransportFabricEvent> {
        if (_.isNil(data) || _.isNil(data.payload) || _.isNil(data.payload.header) || _.isNil(data.payload.header.channel_header)) {
            return [];
        }

        let items = [];
        if (!_.isNil(data.payload.data) && !_.isEmpty(data.payload.data.actions)) {
            for (let action of data.payload.data.actions) {
                items.push(...this.parseEventBlockAction(data.payload.header.channel_header, action));
            }
        }
        return items;
    }

    private parseEventBlockAction(header: any, action: any): Array<ITransportFabricEvent> {
        if (
            _.isNil(action.payload.action) ||
            _.isNil(action.payload.action.proposal_response_payload) ||
            _.isNil(action.payload.action.proposal_response_payload.extension) ||
            _.isNil(action.payload.action.proposal_response_payload.extension.events)
        ) {
            return [];
        }

        let data = action.payload.action.proposal_response_payload.extension.events;

        let name = data.event_name;
        let payload = data.payload.toString();
        let chaincode = data.chaincode_id;

        if (name !== TransportFabric.chaincodeEvent) {
            if (ObjectUtil.isJSON(payload)) {
                payload = TransformUtil.toJSON(payload);
                if (ObjectUtil.instanceOf(payload, ['data', 'name']) || payload.name === name) {
                    payload = payload.data;
                }
            }
            return [this.createEvent(name, header, chaincode, payload)];
        }

        let items = TransformUtil.toJSONMany(JSON.parse(payload));
        return items.map(item => this.createEvent(item.name, header, chaincode, item.data));
    }

    private createEvent(name: string, header: any, chaincode: string, data: string): ITransportFabricEvent {
        return {
            name,
            chaincode,
            data,
            channel: header.channel_id,
            transactionHash: header.tx_id,
            createdDate: new Date(header.timestamp)
        };
    }
}
