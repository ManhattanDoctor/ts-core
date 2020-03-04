import { ITransportCommand, ITransportCommandOptions, TransportCommand, TransportCommandAsync, TransportCommandWaitDelay } from '@ts-core/common/transport';
import { TransportInvalidDataError } from '@ts-core/common/transport/error';
import { TransformUtil } from '@ts-core/common/util';
import { Message } from 'amqplib';
import { Type } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import * as _ from 'lodash';

export class TransportAmqpRequestPayload<U = any> implements ITransportCommandOptions {
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
        let errors = validateSync(payload);
        if (!_.isEmpty(errors)) {
            throw new TransportInvalidDataError(`Invalid payload: validation failed`, errors);
        }

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
    public request: U;

    @IsNumber()
    public timeout: number;

    @IsEnum(TransportCommandWaitDelay)
    public waitDelay: TransportCommandWaitDelay;

    @IsOptional()
    @IsNumber()
    public waitMaxCount: number;

    @Type(() => Date)
    @IsOptional()
    @IsDate()
    public expiredDate: Date;

    @IsBoolean()
    public isNeedReply: boolean;
}
