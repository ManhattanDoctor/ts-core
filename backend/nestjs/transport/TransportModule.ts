import { DynamicModule, Global, Provider } from '@nestjs/common';
import { ExtendedError } from '../../../common/error';
import { Logger } from '../../../common/logger';
import { Transport, TransportLocal } from '../../../common/transport';

@Global()
export class TransportModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings?: ITransportModuleSettings): DynamicModule {
        let providers: Array<Provider> = [];
        let type = settings ? settings.type : TransportType.LOCAL;
        switch (type) {
            case TransportType.LOCAL:
                providers.push({
                    provide: Transport,
                    inject: [Logger],
                    useFactory: (logger: Logger) => {
                        return new TransportLocal(logger);
                    }
                });
                break;
            default:
                throw new ExtendedError(`Can't to create transport for ${type} type`);
        }

        return {
            module: TransportModule,
            imports: [],
            providers,
            exports: providers
        };
    }
}

export interface ITransportModuleSettings {
    type: TransportType;
}

export enum TransportType {
    LOCAL = 'LOCAL'
}
