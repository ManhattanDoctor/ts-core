import { ExtendedError } from '@ts-core/common/error';
import { TransportCommand } from '@ts-core/common/transport';
import { Exclude } from 'class-transformer';
import { ITransportFabricStub, ITransportFabricStubHolder } from '../stub';
import { ITransportCommandFabric } from '../TransportFabric';
import { ITransportFabricCommandOptions } from '../ITransportFabricCommandOptions';
import { ValidateUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { ITransportCryptoManager } from '@ts-core/common/transport/crypto';
import { ISignature, IKeyAsymmetric } from '@ts-core/common/crypto';
import { IsBoolean } from 'class-validator';

export class TransportCommandFabric<T> extends TransportCommand<T> implements ITransportCommandFabric<T>, ITransportFabricStubHolder {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static sign<U>(command: TransportCommand<U>, manager: ITransportCryptoManager, key: IKeyAsymmetric, nonce?: string): ISignature {
        if (_.isNaN(nonce)) {
            nonce = Date.now().toString();
        }
        return {
            value: manager.sign(command, nonce, key.privateKey),
            publicKey: key.publicKey,
            algorithm: manager.algorithm,
            nonce
        };
    }

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

    constructor(name: string, request?: T, id?: string, isQuery?: boolean) {
        super(name, request, id);
        this.isQuery = isQuery;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: T): T {
        if (!_.isObject(value)) {
            throw new ExtendedError(`Request must be an object`);
        }
        ValidateUtil.validate(value);
        return super.validateRequest(value);
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
