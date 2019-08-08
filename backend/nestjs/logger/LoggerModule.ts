import { DynamicModule, Global, Provider } from '@nestjs/common';
import { Logger } from '../../../common/logger';
import { LoggerLevel } from '../../../common/logger/ILogger';
import { ILoggerSettings } from '../../settings';
import { DefaultLogger } from './DefaultLogger';

@Global()
export class LoggerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ILoggerSettings): DynamicModule {
        const providers: Array<Provider> = [];

        providers.push({
            provide: Logger,
            useValue: settings.logger || new DefaultLogger(settings.loggerLevel || LoggerLevel.LOG)
        });

        return {
            module: LoggerModule,
            imports: [],
            providers,
            exports: providers
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {}
}
