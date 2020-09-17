import { TransportCommandOptions } from '@ts-core/common/transport';
import { ISignature } from '@ts-core/common/crypto';
import { ITransportFabricCommandOptions } from './ITransportFabricCommand';
import { IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Signature implements ISignature {
    @IsString()
    nonce: string;

    @IsString()
    value: string;

    @IsString()
    algorithm: string;

    @IsString()
    publicKey: string;
}

export class TransportFabricCommandOptions extends TransportCommandOptions implements ITransportFabricCommandOptions {
    @IsString()
    @IsOptional()
    userId?: string;

    @IsOptional()
    @Type(() => Signature)
    @ValidateNested()
    signature?: Signature;
}