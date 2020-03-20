import { EnvSettingsStorage, ILoggerSettings } from '@ts-core/backend/settings';
import { ITransportAmqpSettings } from '@ts-core/backend/transport/amqp';
import { ILogger, LoggerLevel } from '@ts-core/common/logger';
import { ITransportFabricSettings } from './fabric/transport/ITransportFabricSettings';

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
        return this.getValue('FABRIC_IDENTITY', 'user1');
    }

    public get fabricIdentityMspId(): string {
        return this.getValue('FABRIC_IDENTITY_MSP_ID', 'Org1MSP');
    }

    public get fabricIdentityPrivateKey(): string {
        return this.getValue('FABRIC_IDENTITY_PRIVATE_KEY', '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgJXSS8DqIg9htIQJa\nFC2deN9kmnOKOdIQvk3z10ceuAmhRANCAATok3hIK5WZcVUBMR+qeyLbUBeR9ufm\nPtSsWloH/0YfC1txZ6QCPL7IUzwlMrwwQa82OV8954begPVh2O46Fvn1\n-----END PRIVATE KEY-----\n');
    }

    public get fabricIdentityCertificate(): string {
        return this.getValue(
            'FABRIC_IDENTITY_CERTIFICATE',
            '-----BEGIN CERTIFICATE-----\nMIICjjCCAjWgAwIBAgIUCQLXpk7IK6Mw2lw6pgKn507YfpEwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE5MTUzOTAwWhcNMjEwMzE5MTU0\nNDAwWjBCMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw\nYXJ0bWVudDExDjAMBgNVBAMTBXVzZXIxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAE6JN4SCuVmXFVATEfqnsi21AXkfbn5j7UrFpaB/9GHwtbcWekAjy+yFM8JTK8\nMEGvNjlfPeeG3oD1YdjuOhb59aOB1zCB1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUAQU6Wm+pWzxy5jYP0Lj5gu1ivUUwKwYDVR0jBCQw\nIoAg8GuSK+7N1xyVYfLDRSicU5tv3CpnZpYZ0cxkEr7ACPswaAYIKgMEBQYHCAEE\nXHsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwi\naGYuRW5yb2xsbWVudElEIjoidXNlcjEiLCJoZi5UeXBlIjoiY2xpZW50In19MAoG\nCCqGSM49BAMCA0cAMEQCIHgFe6HYdlTowM/+zm86JnWn+Qpgx0lYVugzP95Ll4oU\nAiARGkhAwhjC68W3UNTizR9ahB1v6lzLYG1jBBoeI7C9LA==\n-----END CERTIFICATE-----\n'
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
