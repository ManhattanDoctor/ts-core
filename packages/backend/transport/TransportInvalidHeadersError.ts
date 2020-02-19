import { ExtendedError } from '@ts-core/common/error';

export class TransportInvalidHeadersError extends ExtendedError<void> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE = 5100;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(message: string) {
        super(message, TransportInvalidHeadersError.ERROR_CODE);
    }
}
