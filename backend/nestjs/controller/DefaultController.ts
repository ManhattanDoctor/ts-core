import { BadRequestException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { ExtendedError } from '../../../common/error/ExtendedError';
import { ILoggerService, LoggerWrapper } from '../../../common/logger';

export abstract class DefaultController<U, V> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(logger: ILoggerService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    public async execute(params: U): Promise<V> {
        throw new ExtendedError('Method must be implemented', HttpStatus.NOT_IMPLEMENTED);
    }

    public async executeExtended(...params): Promise<V> {
        throw new ExtendedError('Method must be implemented', HttpStatus.NOT_IMPLEMENTED);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async validateRequest(value: U): Promise<U> {
        let errors: Array<ValidationError> = await validate(value, this.validatorOptions);
        if (errors && errors.length > 0) {
            this.error(`Unable to make request`, errors.toString());
            throw new BadRequestException(errors.toString());
        }
        return value;
    }

    protected get validatorOptions(): ValidatorOptions {
        return { validationError: { target: false } };
    }

    protected async validateResponse(value: V, logMessage?: string): Promise<V> {
        let errors: Array<ValidationError> = await validate(value, this.validatorOptions);
        if (errors && errors.length > 0) {
            this.error(`Unable to make response`, errors.toString());
            throw new InternalServerErrorException(errors.toString());
        }
        if (logMessage) {
            this.log(logMessage);
        }
        return value;
    }
}
