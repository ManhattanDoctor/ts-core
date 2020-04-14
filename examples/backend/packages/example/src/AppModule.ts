import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { TransportAmqp2 } from '@ts-core/backend/transport/amqp';
import { Logger } from '@ts-core/common/logger';
import { FileUtil } from '@ts-core/backend/file';
import { PromiseHandler } from '@ts-core/common/promise';
import { MapCollection } from '@ts-core/common/map';
import { ITransport, Transport, TransportCommandAsync, TransportCommandWaitDelay } from '@ts-core/common/transport';
import { TransportLocal } from '@ts-core/common/transport/local';
import { AppSettings } from './AppSettings';
import { TransportFabric } from '@ts-core/blockchain-fabric/transport';
import { TestCommand } from './handler/TestCommand';
import { TestHandler } from './handler/TestHandler';
import { UserAddHandler } from './handler/UserAddHandler';
import { UserGetCommand } from './handler/UserGetCommand';
import { UserGetHandler } from './handler/UserGetHandler';
import { UserRemoveHandler } from './handler/UserRemoveHandler';
import * as _ from 'lodash';
import { Chaincode } from './service/Chaincode';
import { FabricApi } from '@ts-core/blockchain-fabric/api';
import { TransportFabricBlockParser } from '@ts-core/blockchain-fabric/transport/block';
import { UserAddCommand } from './handler/UserAddCommand';
import { ObjectUtil } from '@ts-core/common/util';

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
                        item.readonlyCommands = [UserGetCommand.NAME];
                        await item.connect();
                        return item;
                    }
                },
                {
                    provide: Transport,
                    useExisting: TransportFabric
                },
                {
                    provide: FabricApi,
                    useFactory: async (logger: Logger) => {
                        let item = new FabricApi(logger, settings);
                        await item.connect();
                        return item;
                    }
                },
                Chaincode
            ],
            controllers: [UserGetHandler, UserAddHandler, UserRemoveHandler, TestHandler]
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(@Inject(Logger) private logger: Logger, private settings: AppSettings, private fabric: TransportFabric, private api: FabricApi) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        // this.transportTest();
        this.fabricClientTest();
    }

    private async fabricClientTest(): Promise<void> {
        await PromiseHandler.delay(1000);

        let a = { id: '1' };
        let b = { id: '2' };
        let c = { id: '3' };

        let map = new MapCollection('id',0);
        map.addItems([a, b, c]);
        console.log(map.collection);
        /*
        let parser = new TransportFabricBlockParser();
        let blockLast = await this.api.getBlockNumber();
        this.logger.log(`Last block is ${blockLast}`);

        for (let i = blockLast - 1; i < blockLast; i++) {
            this.logger.log(`Getting block ${i}...`);
            let block = await this.api.getBlock(i);
            await FileUtil.jsonSave(`block${i}.json`, block);
            await FileUtil.jsonSave(`block${i}_parsed.json`, parser.parse(block));
        }
        */

        // this.fabric.send(new TestCommand(`Five`), this.settings.fabricUserOptions);
        // this.fabric.send(new TestCommand(`Six`), this.settings.fabricUserOptions);

        /*
        try {
            let userId = 'Renat';
            let item = null;
            item = await this.fabric.sendListen(new UserGetCommand(userId), this.settings.fabricUserOptions);
            
            if (_.isNil(item)) {
                item = await this.fabric.sendListen(
                    new UserAddCommand({ id: userId, publicKey: this.settings.fabricUserOptions.fabricUserPublicKey }),
                    this.settings.fabricUserOptions
                );
            }
            console.log(item);
        } catch (error) {
            console.log(error.message);
        }
        */
    }
}
