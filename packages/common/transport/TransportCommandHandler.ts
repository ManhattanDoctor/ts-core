import { ILogger } from '../logger';
import { AbstractTransportCommandHandler } from './AbstractTransportCommandHandler';
import { ITransport, ITransportCommand } from './ITransport';

export abstract class TransportCommandHandler<U, T extends ITransportCommand<U>> extends AbstractTransportCommandHandler<U, T> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(logger: ILogger, transport: ITransport, name: string) {
        super(logger, transport);

        this.transport.listen<T>(name).subscribe(async command => {
            try {
                let request = this.checkRequest(command.request);
                let response = await this.execute(request);
                this.transport.complete(command, this.checkResponse(response));
            } catch (error) {
                this.handleError(command, error);
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(params: any): any {
        return params;
    }

    // --------------------------------------------------------------------------
    //
    //  Abstract Methods
    //
    // --------------------------------------------------------------------------

    protected abstract async execute(params: U): Promise<any>;
}
