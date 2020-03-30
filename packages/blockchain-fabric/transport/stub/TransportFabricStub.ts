import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ChaincodeStub } from 'fabric-shim';
import * as _ from 'lodash';
import { TransportFabricRequestPayload } from '../TransportFabricRequestPayload';
import { ITransportFabricStub } from './ITransportFabricStub';

export class TransportFabricStub implements ITransportFabricStub {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _userId: string;
    private _userPublicKey: string;

    private _stub: ChaincodeStub;
    private _isSignatureVerified: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(payload: TransportFabricRequestPayload, stub: ChaincodeStub, isSignatureVerified: boolean) {
        this._stub = stub;
        this._userId = payload.options.fabricUserId;
        this._userPublicKey = payload.options.fabricUserPublicKey;
        this._isSignatureVerified = isSignatureVerified;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async hasState(key: string): Promise<boolean> {
        let buffer = await this.stub.getState(key);
        return !_.isNil(buffer) && buffer.length > 0;
    }

    public async getState<U>(key: string, type: ClassType<U> = null, isNeedValidate: boolean = true): Promise<U> {
        let buffer = await this.stub.getState(key);
        if (_.isNil(buffer) || buffer.length === 0) {
            return null;
        }
        let value = TransformUtil.toJSON(buffer.toString(TransformUtil.ENCODING));
        if (_.isNil(type) || _.isNil(value)) {
            return value;
        }
        let item: U = TransformUtil.toClass<U>(type, value);
        if (isNeedValidate) {
            ValidateUtil.validate(item);
        }
        return item;
    }

    public async putState<U>(key: string, value: U, isNeedValidate: boolean = true, isNeedTransform: boolean = true): Promise<U> {
        if (isNeedValidate) {
            ValidateUtil.validate(value);
        }
        let item = isNeedTransform ? TransformUtil.fromClass(value) : value;
        await this.stub.putState(key, Buffer.from(TransformUtil.fromJSON(item), TransformUtil.ENCODING));
        return item;
    }

    public async deleteState(key: string): Promise<void> {
        return this.stub.deleteState(key);
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

    public get isSignatureVerified(): boolean {
        return this._isSignatureVerified;
    }
}
