import { LoggerWrapper } from '../../common/logger';
import { LoggerLevel } from '../../common/logger/ILogger';

export class DefaultLogger extends LoggerWrapper {
    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor(level: LoggerLevel) {
        super(console, null, level);
        console['verbose'] = console.log;
    }
}
