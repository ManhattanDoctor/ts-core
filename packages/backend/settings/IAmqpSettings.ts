export interface IAmqpSettings {
    readonly amqpHost: string;
    readonly amqpPort: number;
    readonly amqpVhost?: string;
    readonly amqpUserName: string;
    readonly amqpPassword: string;
    readonly amqpProtocol: string;
}
