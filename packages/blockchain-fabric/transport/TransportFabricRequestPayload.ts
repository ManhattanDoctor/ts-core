import { TransportCommandAsync, ITransportCommandAsync } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { IsBoolean, IsDefined, IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ChaincodeStub } from 'fabric-shim';
import { ITransportFabricCommandOptions } from './ITransportFabricCommandOptions';
import { ITransportFabricStub, TransportFabricStub, ITransportFabricStubHolder } from './stub';
import { ITransportCommandFabricAsync, TransportFabric } from './TransportFabric';
import { TransportFabricCommandOptions } from './TransportFabricCommandOptions';

// --------------------------------------------------------------------------
//
//  Interface
//
// --------------------------------------------------------------------------

export interface ITransportFabricRequestPayload<U = any> {
    id: string;
    name: string;
    request: U;
    options: ITransportFabricCommandOptions;
    isNeedReply: boolean;
}

// --------------------------------------------------------------------------
//
//  Class
//
// --------------------------------------------------------------------------

export class TransportFabricRequestPayload<U = any> implements ITransportFabricRequestPayload<U> {
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

    public static createCommand<U, V = any>(payload: TransportFabricRequestPayload<U>, stub: ChaincodeStub): ITransportCommandAsync<U, V> {
        return new TransportCommandFabricAsyncImpl(payload, stub);
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

    @Type(() => TransportFabricCommandOptions)
    @IsDefined()
    @ValidateNested()
    public options: TransportFabricCommandOptions;

    @IsBoolean()
    public isNeedReply: boolean;
}

// --------------------------------------------------------------------------
//
//  Command Implementation
//
// --------------------------------------------------------------------------

class TransportCommandFabricAsyncImpl<U, V> extends TransportCommandAsync<U, V> implements ITransportCommandFabricAsync<U, V>, ITransportFabricStubHolder {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _stub: ITransportFabricStub;
    private _options: ITransportFabricCommandOptions;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(payload: TransportFabricRequestPayload, stub: ChaincodeStub) {
        super(payload.name, payload.request, payload.id);

        this._stub = new TransportFabricStub(payload.options, stub);
        this._options = payload.options;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get stub(): ITransportFabricStub {
        return this._stub;
    }

    public get options(): ITransportFabricCommandOptions {
        return this._options;
    }

    public get isQuery(): boolean {
        return false;
    }
}
