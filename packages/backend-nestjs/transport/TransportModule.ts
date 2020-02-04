import { DynamicModule, Global, Provider } from '@nestjs/common';
import { IAmqpSettings } from '@ts-core/backend/settings';
import { TransportAmqp } from '@ts-core/backend/transport';
import { ExtendedError } from '@ts-core/common/error';
import { Logger } from '@ts-core/common/logger';
import { Transport, TransportLocal } from '@ts-core/common/transport';

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
            case TransportType.AMQP:
                providers.push({
                    provide: Transport,
                    inject: [Logger],
                    useFactory: async (logger: Logger) => {
                        let item = new TransportAmqp(logger, settings.options);
                        await item.connect();
                        return item;
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
    options?: IAmqpSettings;
}

export enum TransportType {
    LOCAL = 'LOCAL',
    AMQP = 'AMQP'
}
