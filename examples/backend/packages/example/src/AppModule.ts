import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { TransportAmqp } from '@ts-core/backend/transport';
import { TransportAmqp2 } from '@ts-core/backend/transport/amqp';
import { Logger } from '@ts-core/common/logger';
import { ITransport, TransportCommandAsync, TransportCommandWaitDelay } from '@ts-core/common/transport';
import { TransportHttp } from '@ts-core/common/transport/http';
import { TransportLocal } from '@ts-core/common/transport/local';
import { AppSettings } from './AppSettings';
import { PromiseHandler } from '@ts-core/common/promise';

export class AppModule implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [LoggerModule.forRoot(settings)],
            providers: [
                {
                    provide: AppSettings,
                    useValue: settings
                }
                /*
                {
                    provide: Transport,
                    inject: [Logger, AppSettings],
                    useFactory: async (logger: Logger, settings: AppSettings) => {
                        let transport = new TransportAmqp2(logger);
                        await transport.connect(settings);
                        return transport;
                    }
                }
                */
            ],
            controllers: []
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(@Inject(Logger) private logger: Logger, private settings: AppSettings) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        let http = new TransportHttp(this.logger);
        http.settings.baseURL = 'https://gorest.co.in/public-api/';

        let amqp = new TransportAmqp(this.logger, this.settings);
        let amqp2 = new TransportAmqp2(this.logger);
        let local = new TransportLocal(this.logger);

        await amqp2.connect(this.settings);

        // await amqp.connect();

        let transport: ITransport = amqp2;
        transport.listen<any>('test').subscribe(async command => {
            await PromiseHandler.delay(10000);
            // transport.wait(command);
            transport.complete(command, { message: 'response' });
        });

        try {
            await transport.sendListen(new TransportCommandAsync(`test`, { message: 'request' }), {
                waitDelay: TransportCommandWaitDelay.NORMAL,
                // waitMaxCount: 2,
                waitTimeout: 2000
            });
        } catch (error) {
            // console.log(error);
        }

        /*
        transport.getDispatcher('hello').subscribe(event => {
            console.log(123, event);
        });
        setTimeout(() => transport.dispatch(new TransportEvent(`hello`, { hello: 123 })), 1000);
        */
    }
}
