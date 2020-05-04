import { EnvSettingsStorage, ILoggerSettings } from '@ts-core/backend/settings';
import { ITransportAmqpSettings } from '@ts-core/backend/transport/amqp';
import { ILogger, LoggerLevel } from '@ts-core/common/logger';
import { ITransportFabricSettings } from '@ts-core/blockchain-fabric/transport';
import { ITransportFabricCommandOptions } from '@ts-core/blockchain-fabric/transport';
import { AbstractSettingsStorage } from '@ts-core/common/settings';
import { ISignature, IKeyAsymmetric } from '@ts-core/common/crypto';

export class AppSettings extends EnvSettingsStorage implements ILoggerSettings, ITransportFabricSettings, ITransportAmqpSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public logger?: ILogger;

    // --------------------------------------------------------------------------
    //
    //  Public Fabric Properties
    //
    // --------------------------------------------------------------------------

    public get fabricIdentity(): string {
        return this.getValue('FABRIC_IDENTITY');
    }

    public get fabricIdentityMspId(): string {
        return this.getValue('FABRIC_IDENTITY_MSP_ID');
    }

    public get fabricIdentityPrivateKey(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('FABRIC_IDENTITY_PRIVATE_KEY'));
    }

    public get fabricIdentityCertificate(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('FABRIC_IDENTITY_CERTIFICATE'));
    }

    public get fabricChaincodeName(): string {
        return this.getValue('FABRIC_CHAINCODE_NAME');
    }

    public get fabricNetworkName(): string {
        return this.getValue('FABRIC_NETWORK_NAME');
    }

    public get fabricConnectionSettingsPath(): string {
        return this.getValue('FABRIC_CONNECTION_SETTINGS_PATH');
    }

    public get fabricUserId(): string {
        return this.getValue('FABRIC_USER_ID');
    }

    public get fabricUserPublicKey(): string {
        return this.getValue('FABRIC_USER_PUBLIC_KEY');
    }

    public get fabricUserPrivateKey(): string {
        return this.getValue('FABRIC_USER_PRIVATE_KEY');
    }

    public get fabricUserKey(): IKeyAsymmetric {
        return {
            publicKey: this.fabricUserPublicKey,
            privateKey: this.fabricUserPrivateKey
        };
    }

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
