import { ExtendedError } from '../../common/error';

export class TransportWaitError extends ExtendedError<void> {
    //--------------------------------------------------------------------------
    //
    //  Constants
    //
    //--------------------------------------------------------------------------

    public static ERROR_CODE = 5000;

    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor(message: string) {
        super(message, TransportWaitError.ERROR_CODE);
    }
}
