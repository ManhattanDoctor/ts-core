import { NestFactory } from '@nestjs/core';
import { DefaultLogger } from '@ts-core/backend-nestjs/logger';
import * as shim from 'fabric-shim';
import { AppModule } from './AppModule';
import { AppSettings } from './AppSettings';
import { Chaincode } from './service/Chaincode';

async function bootstrap() {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));
    let context = await NestFactory.createApplicationContext(AppModule.forRoot(settings), { logger });
    // let chaincode = context.get(Chaincode) as shim.ChaincodeInterface;
    // shim.start(chaincode);
}

bootstrap();
