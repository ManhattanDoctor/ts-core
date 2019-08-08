import { ExtendedError } from '../../common/error';
import { ILogger, LoggerWrapper } from '../../common/logger';
import { ITransport, ITransportCommand } from './ITransport';
import { TransportWaitError } from './TransportWaitError';

export abstract class TransportCommandHandler<U, V, T extends ITransportCommand<U, V>> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(logger: ILogger, protected transport: ITransport, name: string) {
        super(logger);
        this.transport.listen<T>(name).subscribe(async command => {
            try {
                this.transport.response(command, await this.execute(command.request));
            } catch (error) {
                this.handleError(command, error);
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected abstract async execute(params: U): Promise<V>;

    protected handleError(command: T, error: Error): void {
        if (error instanceof TransportWaitError) {
            this.transport.wait(command);
            return;
        }
        this.transport.response(command, error);
        this.error(error, error instanceof ExtendedError && !error.isFatal ? '' : error.stack);
    }
}
