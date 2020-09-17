import { ITransportCommandOptions, ITransportCommand, ITransportCommandAsync } from '@ts-core/common/transport';
import { ISignature } from '@ts-core/common/crypto';
import { ITransportFabricStub } from './stub';

export interface ITransportFabricCommandOptions extends ITransportCommandOptions {
    userId?: string;
    signature?: ISignature;
}

export interface ITransportCommandFabric<U> extends ITransportCommand<U> {
    readonly stub: ITransportFabricStub;
}

export interface ITransportCommandFabricAsync<U, V> extends ITransportCommandFabric<U>, ITransportCommandAsync<U, V> {}
