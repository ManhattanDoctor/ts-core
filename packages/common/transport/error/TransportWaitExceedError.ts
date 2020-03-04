import { ExtendedError } from '../../error';
import { ITransportCommand } from '../ITransport';

export class TransportWaitExceedError<U = any> extends ExtendedError<ITransportCommand<U>> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE = 5003;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(command: ITransportCommand<U>) {
        super(`${command.name} (${command.id}) wait timeout or count exceeded`, TransportWaitExceedError.ERROR_CODE);
    }
}
