import { NestFactory } from '@nestjs/core';
import { DefaultLogger } from '@ts-core/backend-nestjs/logger';
import { AppModule } from './AppModule';
import { AppSettings } from './AppSettings';

async function bootstrap() {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));
    await NestFactory.createApplicationContext(AppModule.forRoot(settings), { logger });
}

bootstrap();
