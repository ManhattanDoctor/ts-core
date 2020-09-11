import { ITransportHttpCommandAsync } from './TransportHttp';
import { LoggerWrapper } from '../../logger';
import { ExtendedError } from '../../error';

export abstract class TransportHttpCommandAsyncHandler<T extends ITransportHttpCommandAsync<U, V>, U, V> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(request: U): Promise<V> {
        throw new ExtendedError('Method must be implemented', ExtendedError.HTTP_CODE_NOT_IMPLEMENTED);
    }

    protected async executeExtended(request: U, ...params): Promise<V> {
        throw new ExtendedError('Method must be implemented', ExtendedError.HTTP_CODE_NOT_IMPLEMENTED);
    }
}
