import { EnvSettingsStorage, ILoggerSettings } from '@ts-core/backend/settings';
import { ILogger, LoggerLevel } from '@ts-core/common/logger';
import { ITransportAmqpSettings } from './amqp/ITransportAmqpSettings';

export class AppSettings extends EnvSettingsStorage implements ILoggerSettings, ITransportAmqpSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public logger?: ILogger;

    // --------------------------------------------------------------------------
    //
    //  Public Amqp Properties
    //
    // --------------------------------------------------------------------------

    public get amqpHost(): string {
        return this.getValue('RABBITMQ_HOST');
    }

    public get amqpUserName(): string {
        return this.getValue('RABBITMQ_USERNAME');
    }

    public get amqpPassword(): string {
        return this.getValue('RABBITMQ_PASSWORD');
    }

    public get amqpPort(): number {
        return this.getValue('RABBITMQ_PORT', 5672);
    }

    public get amqpProtocol(): string {
        return this.getValue('RABBITMQ_PROTOCOL');
    }

    public get amqpVhost(): string {
        return this.getValue('RABBITMQ_VHOST');
    }

    public get isExitApplicationOnDisconnect(): boolean {
        return this.getValue('RABBITMQ_IS_EXIT_APPLOCATION_ON_DISCONNECT', true);
    }

    // --------------------------------------------------------------------------
    //
    //  Logger Properties
    //
    // --------------------------------------------------------------------------

    public get loggerLevel(): LoggerLevel {
        return this.getValue('LOGGER_LEVEL', LoggerLevel.ALL);
    }
}
