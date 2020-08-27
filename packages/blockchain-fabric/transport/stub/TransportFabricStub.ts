import { TransformUtil, ValidateUtil, ObjectUtil } from '@ts-core/common/util';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ChaincodeStub, Iterators, StateQueryResponse } from 'fabric-shim';
import * as _ from 'lodash';
import { ITransportFabricStub } from './ITransportFabricStub';
import { ITransportFabricCommandOptions } from '../ITransportFabricCommandOptions';
import { ITransportEvent } from '@ts-core/common/transport';
import { TransportFabricChaincode } from '../../chaincode';
import { TransportFabric } from '../TransportFabric';

export class TransportFabricStub implements ITransportFabricStub {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _stub: ChaincodeStub;
    private _chaincode: TransportFabricChaincode;

    private _requestId: string;

    private _userId: string;
    private _userPublicKey: string;

    private eventsToDispatch: Array<ITransportEvent<any>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(stub: ChaincodeStub, requestId: string, options: ITransportFabricCommandOptions, chaincode: TransportFabricChaincode) {
        this._stub = stub;
        this._requestId = requestId;
        this._chaincode = chaincode;

        this.eventsToDispatch = new Array();

        if (!_.isNil(options)) {
            this._userId = options.userId;
            if (!_.isNil(options.signature)) {
                this._userPublicKey = options.signature.publicKey;
            }
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public State Methods
    //
    // --------------------------------------------------------------------------

    public async hasState(key: string): Promise<boolean> {
        let buffer = await this.stub.getState(key);
        return !_.isNil(buffer) && buffer.length > 0;
    }

    public async getState<U>(key: string, type: ClassType<U> = null, isNeedValidate: boolean = true): Promise<U> {
        let value = TransformUtil.toJSON(await this.getStateRaw(key));
        if (_.isNil(type) || _.isNil(value)) {
            return value;
        }
        let item: U = TransformUtil.toClass<U>(type, value);
        if (isNeedValidate) {
            ValidateUtil.validate(item);
        }
        return item;
    }

    public async getStateRaw(key: string): Promise<string> {
        let buffer = await this.stub.getState(key);
        if (_.isNil(buffer) || buffer.length === 0) {
            return null;
        }
        return buffer.toString(TransformUtil.ENCODING);
    }

    public async putState<U>(
        key: string,
        value: U,
        isNeedValidate: boolean = true,
        isNeedTransform: boolean = true,
        isNeedSortKeys: boolean = true
    ): Promise<U> {
        if (isNeedValidate) {
            ValidateUtil.validate(value);
        }
        let item = value;
        if (isNeedTransform) {
            item = TransformUtil.fromClass(value);
        }
        if (isNeedSortKeys) {
            item = ObjectUtil.sortKeys(item, true);
        }
        await this.putStateRaw(key, TransformUtil.fromJSON(item));
        return item;
    }

    public async getStateByRange(startKey: string, endKey: string): Promise<Iterators.StateQueryIterator> {
        return this.stub.getStateByRange(startKey, endKey);
    }

    public async getStateByRangeWithPagination(
        startKey: string,
        endKey: string,
        pageSize: number,
        bookmark?: string
    ): Promise<StateQueryResponse<Iterators.StateQueryIterator>> {
        return this.stub.getStateByRangeWithPagination(startKey, endKey, pageSize, bookmark);
    }

    public async putStateRaw(key: string, item: string): Promise<void> {
        return this.stub.putState(key, Buffer.from(item, TransformUtil.ENCODING));
    }

    public async removeState(key: string): Promise<void> {
        return this.stub.deleteState(key);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Event Methods
    //
    // --------------------------------------------------------------------------

    public async dispatch<T>(value: ITransportEvent<T>, isNeedValidate: boolean = true): Promise<void> {
        if (isNeedValidate) {
            ValidateUtil.validate(value);
        }
        this.chaincode.dispatch(value);
        this.eventsToDispatch.push(value);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public dispatchEvents(): void {
        if (_.isEmpty(this.eventsToDispatch)) {
            return;
        }

        let items = TransformUtil.fromJSONMany(TransformUtil.fromClassMany(this.eventsToDispatch));
        this.stub.setEvent(TransportFabric.chaincodeEvent, Buffer.from(JSON.stringify(items), TransformUtil.ENCODING));
    }

    public destroy(): void {
        this.eventsToDispatch = null;

        this._stub = null;
        this._chaincode = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    public get chaincode(): TransportFabricChaincode {
        return this._chaincode;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get requestId(): string {
        return this._requestId;
    }

    public get userId(): string {
        return this._userId;
    }

    public get userPublicKey(): string {
        return this._userPublicKey;
    }

    public get transactionHash(): string {
        return !_.isNil(this.stub) ? this.stub.getTxID() : null;
    }

    public get transactionDate(): Date {
        return !_.isNil(this.stub) ? this.stub.getTxTimestamp().toDate() : null;
    }

    public get stub(): ChaincodeStub {
        return this._stub;
    }
}
