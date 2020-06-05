import { ExtendedError } from '@ts-core/common/error';
import { TransportCommandAsync } from '@ts-core/common/transport';
import { ITransportFabricStub, ITransportFabricStubHolder } from '../stub';
import { Exclude } from 'class-transformer';
import { ITransportCommandFabricAsync } from '../TransportFabric';
import { ITransportFabricCommandOptions } from '../ITransportFabricCommandOptions';
import * as _ from 'lodash';
import { ITransportCryptoManager } from '@ts-core/common/transport/crypto';
import { IKeyAsymmetric, ISignature } from '@ts-core/common/crypto';
import { TransportCommandFabric } from './TransportCommandFabric';
import { IsBoolean } from 'class-validator';

export class TransportCommandFabricAsync<U, V> extends TransportCommandAsync<U, V> implements ITransportCommandFabricAsync<U, V>, ITransportFabricStubHolder {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsBoolean()
    public isQuery: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, request?: U, id?: string, isQuery?: boolean) {
        super(name, request, id);
        this.isQuery = isQuery;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: U): U {
        if (!_.isObject(value)) {
            throw new ExtendedError(`Request must be an object`);
        }
        return super.validateRequest(value);
    }

    protected validateResponse(value: V): V {
        if (!_.isObject(value)) {
            throw new ExtendedError(`Response must be an object`);
        }
        return super.validateResponse(value);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public sign(manager: ITransportCryptoManager, key: IKeyAsymmetric, nonce?: string): ISignature {
        return TransportCommandFabric.sign(this, manager, key, nonce);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    public get stub(): ITransportFabricStub {
        throw new ExtendedError(`Can't get access to stub directly from command`);
    }

    @Exclude()
    public get options(): ITransportFabricCommandOptions {
        throw new ExtendedError(`Can't get access to options directly from command`);
    }
}
