import { EnvSettingsStorage, ILoggerSettings } from '@ts-core/backend/settings';
import { ITransportAmqpSettings } from '@ts-core/backend/transport/amqp';
import { ILogger, LoggerLevel } from '@ts-core/common/logger';
import { ITransportFabricSettings } from '@ts-core/blockchain-fabric/transport';
import { ITransportFabricCommandOptions } from '@ts-core/blockchain-fabric/transport';

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

    public get fabricUserOptions(): ITransportFabricCommandOptions {
        return {
            fabricUserId: 'Renat',
            fabricUserPublicKey: 'e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8',
            fabricUserPrivateKey:
                'e87501bc00a3db3ba436f7109198e0cb65c5f929eabcedbbb5a9874abc2c73a3e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8'
        };
    }

    public get fabricIdentity(): string {
        return this.getValue('FABRIC_IDENTITY', 'user1');
    }

    public get fabricIdentityMspId(): string {
        return this.getValue('FABRIC_IDENTITY_MSP_ID', 'Org1MSP');
    }

    public get fabricIdentityPrivateKey(): string {
        return this.getValue(
            'FABRIC_IDENTITY_PRIVATE_KEY',
            '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgFV2tecLU03cs8uQG\nOTqAvoGZT/WNvY2sFsvGLAlLX9ahRANCAATRwhiQNQGvRszE5vjN1ZUU0Qor5aVV\nmpff+rFd8szAH9VIw+VXDExI1D2u1OPR3Jci2VfE8jq/IPg65QuKh/wE\n-----END PRIVATE KEY-----'
        );
    }

    public get fabricIdentityCertificate(): string {
        return this.getValue(
            'FABRIC_IDENTITY_CERTIFICATE',
            '-----BEGIN CERTIFICATE-----\nMIICjjCCAjWgAwIBAgIUOiQB5yeOWfYmGPVO8VZUA0ouxLMwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzI0MTYwNzAwWhcNMjEwMzI0MTYx\nMjAwWjBCMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw\nYXJ0bWVudDExDjAMBgNVBAMTBXVzZXIxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAE0cIYkDUBr0bMxOb4zdWVFNEKK+WlVZqX3/qxXfLMwB/VSMPlVwxMSNQ9rtTj\n0dyXItlXxPI6vyD4OuULiof8BKOB1zCB1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUC+JeBv82tQd2FXIdZvx9mg57wCgwKwYDVR0jBCQw\nIoAgUn+0FOv3dX+1WR7Fa8jfriCeHzZbH7Jat8R1I2RDTQ8waAYIKgMEBQYHCAEE\nXHsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwi\naGYuRW5yb2xsbWVudElEIjoidXNlcjEiLCJoZi5UeXBlIjoiY2xpZW50In19MAoG\nCCqGSM49BAMCA0cAMEQCIGZJMg1Z7/MdTjqACo8JDaIJ8XBpujZ6K+BTiMDXV6Sp\nAiAAmPhEIica+eb8v+fvDvX6s70o29qOYrXa9ftiI+J5NQ==\n-----END CERTIFICATE-----\n'
        );
    }

    public get fabricChaincodeName(): string {
        return this.getValue('FABRIC_CHAINCODE_NAME', 'test');
    }

    public get fabricNetworkName(): string {
        return this.getValue('FABRIC_NETWORK_NAME', 'mychannel');
    }

    public get fabricConnectionSettingsPath(): string {
        return this.getValue('FABRIC_CONNECTION_SETTINGS_PATH', 'connection.json');
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
