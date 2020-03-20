import { ExtendedError } from '../error';
import { ILogger, LoggerWrapper } from '../logger';
import { TransportWaitError } from './error/TransportWaitError';
import { ITransport, ITransportCommand } from './ITransport';

export abstract class AbstractTransportCommandHandler<U, T extends ITransportCommand<U>> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(logger: ILogger, protected transport: ITransport) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkRequest(params: U): U {
        return params;
    }

    protected handleError(command: T, error: Error): void {
        if (error instanceof TransportWaitError) {
            this.transport.wait(command);
            return;
        }
        this.transport.complete(command, error);
        this.error(error, ExtendedError.instanceOf(error) && !error.isFatal ? '' : error.stack);
    }
}
