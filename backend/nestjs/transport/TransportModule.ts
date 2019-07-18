import { DynamicModule, Global, Provider } from '@nestjs/common';
import { ExtendedError } from '../../../common/error';
import { Logger } from '../../../common/logger';
import { LocalTransport, Transport } from '../../transport';
import { LoggerModule } from '../logger';

@Global()
export class TransportModule {
    //--------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    //--------------------------------------------------------------------------

    public static forRoot(settings?: ITransportModuleSettings): DynamicModule {
        let providers: Array<Provider> = [];
        let type = settings ? settings.type : TransportType.LOCAL;
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
            imports: [LoggerModule],
            providers,
            exports: providers
        };
    }

    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor() {}
}

export interface ITransportModuleSettings {
    type: TransportType;
}

export enum TransportType {
    LOCAL = 'LOCAL'
}
