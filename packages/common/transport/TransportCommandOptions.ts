import * as _ from 'lodash';
import { ITransportCommandOptions, TransportCommandWaitDelay } from './ITransport';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';

export class TransportCommandOptions implements ITransportCommandOptions {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsOptional()
    @IsNumber()
    public timeout?: number;

    @IsOptional()
    @IsNumber()
    public waitMaxCount?: number;

    @IsOptional()
    @IsEnum(TransportCommandWaitDelay)
    public waitDelay?: TransportCommandWaitDelay;
}
