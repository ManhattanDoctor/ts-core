import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { TransportAmqp2 } from '@ts-core/backend/transport/amqp';
import { Logger } from '@ts-core/common/logger';
import { PromiseHandler } from '@ts-core/common/promise';
import { ITransport, Transport, TransportCommandAsync, TransportCommandWaitDelay } from '@ts-core/common/transport';
import { TransportLocal } from '@ts-core/common/transport/local';
import * as _ from 'lodash';
import { AppSettings } from './AppSettings';
import { TransportFabric } from './fabric/transport/TransportFabric';
import { UserAddCommand } from './handler/UserAddCommand';
import { UserAddHandler } from './handler/UserAddHandler';
import { UserGetCommand } from './handler/UserGetCommand';
import { UserGetHandler } from './handler/UserGetHandler';
import { UserRemoveHandler } from './handler/UserRemoveHandler';
import { Chaincode } from './service/Chaincode';

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
                },
                {
                    provide: TransportFabric,
                    inject: [Logger],
                    useFactory: async (logger: Logger) => {
                        let item = new TransportFabric(logger, settings);
                        await item.connect();
                        return item;
                    }
                },
                {
                    provide: Transport,
                    useExisting: TransportFabric
                },
                Chaincode
            ],
            controllers: [UserGetHandler, UserAddHandler, UserRemoveHandler]
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(@Inject(Logger) private logger: Logger, private settings: AppSettings, private fabric: TransportFabric) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        // this.transportTest();
        this.fabricClientTest(this.fabric);
    }

    private async fabricClientTest(transport: TransportFabric): Promise<void> {
        await PromiseHandler.delay(1000);

        // transport.readonlyCommands = ['test'];

        let userId = 'Renat';
        let publicKey = 'e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8';
        let privateKey = 'e87501bc00a3db3ba436f7109198e0cb65c5f929eabcedbbb5a9874abc2c73a3e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8';

        let options = {
            fabricUserId: userId,
            fabricUserPublicKey: publicKey,
            fabricUserPrivateKey: privateKey
        };
        try {
            let item = null;
            item = await transport.sendListen(new UserGetCommand(userId), options);
            if (_.isNil(item)) {
                item = await transport.sendListen(new UserAddCommand({ id: userId, publicKey }), options);
            }
            console.log(item);
        } catch (error) {
            console.log(error.message);
        }
    }

    private async transportTest(): Promise<void> {
        let amqp2 = new TransportAmqp2(this.logger, this.settings);
        await amqp2.connect();

        let local = new TransportLocal(this.logger);
        let transport: ITransport = amqp2;

        transport.listen<any>('test').subscribe(async command => {
            // await PromiseHandler.delay(3000);
            // transport.complete(command, new ExtendedError('Error!23'));
            // transport.complete(command, { message: 'response' });
        });

        for (let i = 0; i < 1; i++) {
            await transport.sendListen(new TransportCommandAsync(`test`, { message: 'request' }), {
                timeout: 5000,
                waitMaxCount: 1,
                waitDelay: TransportCommandWaitDelay.SLOW
            });
        }

        /*
        transport.getDispatcher('hello').subscribe(event => {console.log(123, event)});
        setTimeout(() => transport.dispatch(new TransportEvent(`hello`, { hello: 123 })), 1000);
        */
    }
}
