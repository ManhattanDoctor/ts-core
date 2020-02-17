import * as NestJS from '@nestjs/common';
import { LoggerLevel, LoggerWrapper } from '@ts-core/common/logger';

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
