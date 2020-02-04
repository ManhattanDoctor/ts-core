import { LoggerWrapper } from '@ts-core/common/logger';
import { LoggerLevel } from '@ts-core/common/logger/ILogger';

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
