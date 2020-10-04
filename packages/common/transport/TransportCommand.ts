import * as uuid from 'uuid';
import { ITransportCommand } from './ITransport';
import { IsString, IsDefined } from 'class-validator';
import * as _ from 'lodash';
import { ValidateUtil } from '../util';
import { ITransportCryptoManager } from './crypto';
import { IKeyAsymmetric, ISignature } from '../crypto';

export class TransportCommand<T> implements ITransportCommand<T> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static async sign<U>(command: ITransportCommand<U>, manager: ITransportCryptoManager, key: IKeyAsymmetric, nonce?: string): Promise<ISignature> {
        if (_.isNil(nonce)) {
            nonce = Date.now().toString();
        }
        return {
            value: await manager.sign(command, nonce, key.privateKey),
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

    @IsString()
    public id: string;

    @IsString()
    public name: string;

    @IsDefined()
    public request: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, request?: T, id?: string) {
        this.id = !_.isNil(id) ? id : uuid();
        this.name = name;
        this.request = this.validateRequest(request || ({} as any));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: T): T {
        ValidateUtil.validate(value);
        return value;
    }
}
