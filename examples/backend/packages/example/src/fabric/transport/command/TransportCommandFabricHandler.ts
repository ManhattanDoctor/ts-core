import { ILogger } from '@ts-core/common/logger';
import { AbstractTransportCommandHandler } from '@ts-core/common/transport';
import { ITransportFabricStub } from '../stub';
import { ITransportCommandFabric, TransportFabric } from '../TransportFabric';

export abstract class TransportCommandFabricHandler<U, T extends ITransportCommandFabric<U>> extends AbstractTransportCommandHandler<U, T> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(logger: ILogger, transport: TransportFabric, name: string) {
        super(logger, transport);

        this.transport.listen<T>(name).subscribe(async command => {
            try {
                let request = this.checkRequest(command.request);
                let response = await this.execute(request, command.stub);
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

    protected abstract async execute(params: U, stub: ITransportFabricStub): Promise<any>;
}
