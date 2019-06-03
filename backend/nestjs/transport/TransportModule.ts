import { DynamicModule, Global, Logger, Provider } from '@nestjs/common';
import { ExtendedError } from '../../../common/error/ExtendedError';
import { LocalTransport, Transport } from '../../transport';

@Global()
export class TransportModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(type: TransportType = TransportType.LOCAL): DynamicModule {
        const providers: Array<Provider> = [];

        switch (type) {
            case TransportType.LOCAL:
                providers.push({
                    provide: Transport,
                    inject: [Logger],
                    useFactory: (logger: Logger) => {
                        return new LocalTransport(logger);
                    }
                });
                break;
            default:
                throw new ExtendedError(`Unable to create transport for ${type} type`);
        }

        return {
            module: TransportModule,
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

export enum TransportType {
    LOCAL = 'LOCAL'
}
