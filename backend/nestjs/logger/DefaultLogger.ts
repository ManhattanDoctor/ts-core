import * as NestJS from '@nestjs/common';
import { LoggerWrapper } from '../../../common/logger';
import { LoggerLevel } from '../../../common/logger/ILogger';

export class DefaultLogger extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(level: LoggerLevel) {
        super(NestJS.Logger, null, level);
    }
}
