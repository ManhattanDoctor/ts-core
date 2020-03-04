import { ExtendedError } from '../../error';

export class TransportInvalidDataError extends ExtendedError {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE = 5004;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(message: string, data: any) {
        super(message, TransportInvalidDataError.ERROR_CODE, data);
    }
}
