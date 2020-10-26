import { ITransportCommand, ITransportCommandOptions, TransportCommand, TransportCommandAsync, TransportCommandOptions } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { Message } from 'amqplib';
import { ClassType } from 'class-transformer/ClassTransformer';
import { IsBoolean, IsDefined, ValidateNested, IsOptional, IsString } from 'class-validator';
import * as _ from 'lodash';
import { ITransportAmqpRequestPayload } from './ITransportAmqpRequestPayload';
import { Type } from 'class-transformer';

export class TransportAmqpRequestPayload<U = any> implements ITransportAmqpRequestPayload<U> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static parse<U>(message: Message): TransportAmqpRequestPayload<U> {
        let data = null;
        let content: string = null;
        try {
            content = message.content.toString('utf-8');
            data = TransformUtil.toJSON(content);
        } catch (error) {
            throw new TransportInvalidDataError(`Invalid payload: ${error.message}`, content);
        }

        let payload = TransformUtil.toClass<TransportAmqpRequestPayload<U>>(TransportAmqpRequestPayload, data);
        ValidateUtil.validate(payload);

        if (payload.isNeedReply) {
            let properties = message.properties;
            if (_.isNil(properties) || _.isNil(properties.correlationId) || _.isNil(properties.replyTo)) {
                throw new TransportInvalidDataError(`Invalid message: correlationId or replyTo is nil`, content);
            }
        }

        return payload;
    }

    public static createCommand<U>(payload: TransportAmqpRequestPayload<U>): ITransportCommand<U> {
        let type: ClassType<ITransportCommand<U>> = payload.isNeedReply ? TransportCommandAsync : TransportCommand;
        let command = new type(payload.name, payload.request, payload.id);
        return command;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public id: string;

    @IsString()
    public name: string;

    @IsOptional()
    public request?: U;

    @Type(() => TransportCommandOptions)
    @IsDefined()
    @ValidateNested()
    public options: TransportCommandOptions;

    @IsBoolean()
    public isNeedReply: boolean;
}
