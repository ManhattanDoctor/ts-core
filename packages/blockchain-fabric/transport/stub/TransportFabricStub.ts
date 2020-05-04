import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ChaincodeStub, Iterators } from 'fabric-shim';
import * as _ from 'lodash';
import { ITransportFabricStub } from './ITransportFabricStub';
import { ITransportFabricCommandOptions } from '../ITransportFabricCommandOptions';

export class TransportFabricStub implements ITransportFabricStub {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _stub: ChaincodeStub;

    private _userId: string;
    private _userPublicKey: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(options: ITransportFabricCommandOptions, stub: ChaincodeStub) {
        this._stub = stub;
        this._userId = options.userId;
        this._userPublicKey = options.signature.publicKey;
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

    public async putState<U>(key: string, value: U, isNeedValidate: boolean = true, isNeedTransform: boolean = true): Promise<U> {
        if (isNeedValidate) {
            ValidateUtil.validate(value);
        }
        let item = isNeedTransform ? TransformUtil.fromClass(value) : value;
        await this.putStateRaw(key, TransformUtil.fromJSON(item));
        return item;
    }

    public async putStateRaw(key: string, item: string): Promise<void> {
        return this.stub.putState(key, Buffer.from(item, TransformUtil.ENCODING));
    }

    public async removeState(key: string): Promise<void> {
        return this.stub.deleteState(key);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public createCompositeKey(prefix: string, attributes: Array<string>): string {
        return this.stub.createCompositeKey(prefix, attributes);
    }

    public getStateByPartialCompositeKey(prefix: string, attributes: Array<string>): Promise<Iterators.StateQueryIterator> {
        return this.stub.getStateByPartialCompositeKey(prefix, attributes);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get userId(): string {
        return this._userId;
    }

    public get userPublicKey(): string {
        return this._userPublicKey;
    }

    public get stub(): ChaincodeStub {
        return this._stub;
    }
}
