import { ITransportHttpCommand } from './TransportHttp';
import { LoggerWrapper } from '../../logger';
import { ExtendedError } from '../../error';

export abstract class TransportHttpCommandHandler<T extends ITransportHttpCommand<U>, U> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(request: U): Promise<any> {
        throw new ExtendedError('Method must be implemented', ExtendedError.HTTP_CODE_NOT_IMPLEMENTED);
    }

    protected async executeExtended(request: U, ...params): Promise<any> {
        throw new ExtendedError('Method must be implemented', ExtendedError.HTTP_CODE_NOT_IMPLEMENTED);
    }
}
