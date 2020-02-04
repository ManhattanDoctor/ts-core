import * as NestJS from '@nestjs/common';
import { LoggerWrapper } from '@ts-core/common/logger';
import { LoggerLevel } from '@ts-core/common/logger/ILogger';

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
