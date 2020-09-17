import { ExtendedError } from '../../error';
import { ITransportCommand } from '../ITransport';

export class TransportNoConnectionError<U> extends ExtendedError<ITransportCommand<U>> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE = 5002;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(command: ITransportCommand<U>) {
        super(`${command.name} (${command.id}) no connection`, TransportNoConnectionError.ERROR_CODE);
    }
}
