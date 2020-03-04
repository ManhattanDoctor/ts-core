import { ExtendedError } from '../../error';

export class TransportWaitError<T = any> extends ExtendedError<T> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE = 5000;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(message: string) {
        super(message, TransportWaitError.ERROR_CODE);
    }
}
