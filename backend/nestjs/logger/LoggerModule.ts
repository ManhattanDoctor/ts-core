import { DynamicModule, Global, Logger, Provider } from '@nestjs/common';
import { ExtendedError } from '../../../common/error/ExtendedError';
import { DefaultLogger } from './DefaultLogger';

@Global()
export class LoggerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(type: LoggerType = LoggerType.DEFAULT): DynamicModule {
        const providers: Array<Provider> = [];

        switch (type) {
            case LoggerType.DEFAULT:
                providers.push({
                    provide: Logger,
                    useValue: new DefaultLogger()
                });
                break;
            default:
                throw new ExtendedError(`Unable to create logger for ${type} type`);
        }

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

export enum LoggerType {
    DEFAULT = 'DEFAULT'
}
