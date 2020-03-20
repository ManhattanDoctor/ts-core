import { ExtendedError } from './ExtendedError';

export class UnreachableStatementError extends ExtendedError {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static ERROR_CODE = -1001;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(value: never) {
        super(`Unreachable statement: ${value}`, UnreachableStatementError.ERROR_CODE);
    }
}
