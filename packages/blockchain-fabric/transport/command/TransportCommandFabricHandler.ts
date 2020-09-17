import { ILogger } from '@ts-core/common/logger';
import { AbstractTransportCommandHandler, ITransportCommand, ITransport } from '@ts-core/common/transport';

export abstract class TransportCommandFabricHandler<U, T extends ITransportCommand<U>> extends AbstractTransportCommandHandler<U, T> {
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
                let response = await this.execute(request, command);
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

    protected abstract async execute(request: U, ...params): Promise<any>;
}
