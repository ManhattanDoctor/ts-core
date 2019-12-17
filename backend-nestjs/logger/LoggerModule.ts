import { DynamicModule, Global, Provider } from '@nestjs/common';
import { ILoggerSettings } from '@ts-core/backend/settings';
import { Logger, LoggerLevel } from '@ts-core/common/logger';
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
}
