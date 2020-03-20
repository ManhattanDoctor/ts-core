import { TransportCommand, TransportCommandAsync } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { ClassType } from 'class-transformer/ClassTransformer';
import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';
import { ChaincodeStub } from 'fabric-shim';
import { ITransportFabricCommandOptions } from './ITransportFabricCommandOptions';
import { ITransportFabricStub, TransportFabricStub } from './stub';
import { ITransportCommandFabric, ITransportCommandFabricAsync, TransportFabric } from './TransportFabric';

export class TransportFabricRequestPayload<U = any> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static parse<U = any>(stub: ChaincodeStub): TransportFabricRequestPayload<U> {
        let item = stub.getFunctionAndParameters();
        if (item.fcn !== TransportFabric.chaincodeMethod) {
            throw new TransportInvalidDataError(`Invalid payload: function must be "${TransportFabric.chaincodeMethod}"`, item.fcn);
        }
        if (item.params.length !== 1) {
            throw new TransportInvalidDataError(`Invalid payload: params length must be 1`, item.params.length);
        }
        let content = item.params[0];
        let payload: TransportFabricRequestPayload = null;
        try {
            payload = TransformUtil.toClass<TransportFabricRequestPayload<U>>(TransportFabricRequestPayload, TransformUtil.toJSON(content));
        } catch (error) {
            throw new TransportInvalidDataError(`Invalid payload: ${error.message}`, content);
        }

        ValidateUtil.validate(payload);
        return payload;
    }

    public static createCommand<U>(
        payload: TransportFabricRequestPayload<U>,
        stub: ChaincodeStub,
        isUserSignatureVerified: boolean
    ): ITransportCommandFabric<U> {
        let type: ClassType<ITransportCommandFabric<U>> = payload.isNeedReply ? TransportCommandFabricAsyncImpl : TransportCommandFabricImpl;
        let command = new type(payload, stub, isUserSignatureVerified);
        return command;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public id: string;

    @IsString()
    public name: string;

    @IsOptional()
    public request: U;

    @IsDefined()
    public options: ITransportFabricCommandOptions;

    @IsBoolean()
    public isNeedReply: boolean;

    @IsOptional()
    public signature: string;
}

// --------------------------------------------------------------------------
//
//  Command Implementation
//
// --------------------------------------------------------------------------

class TransportCommandFabricAsyncImpl<U, V> extends TransportCommandAsync<U, V> implements ITransportCommandFabricAsync<U, V> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public stub: ITransportFabricStub;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(payload: TransportFabricRequestPayload, stub: ChaincodeStub, isUserSignatureVerified: boolean) {
        super(payload.name, payload.request, payload.id);
        this.stub = new TransportFabricStub(payload, stub, isUserSignatureVerified);
    }
}

class TransportCommandFabricImpl<T> extends TransportCommand<T> implements ITransportCommandFabric<T> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    public stub: ITransportFabricStub;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(payload: TransportFabricRequestPayload, stub: ChaincodeStub, isUserSignatureVerified: boolean) {
        super(payload.name, payload.request, payload.id);
        this.stub = new TransportFabricStub(payload, stub, isUserSignatureVerified);
    }
}
