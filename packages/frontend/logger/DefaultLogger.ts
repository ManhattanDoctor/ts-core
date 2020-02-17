import { LoggerLevel, LoggerWrapper } from '@ts-core/common/logger';

export class DefaultLogger extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(level: LoggerLevel) {
        super(console, null, level);
        console['verbose'] = console.log;
    }
}
