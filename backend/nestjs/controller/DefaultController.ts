import { HttpStatus } from '@nestjs/common';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import * as _ from 'lodash';
import { ExtendedError } from '../../../common/error';
import { ILogger, LoggerWrapper } from '../../../common/logger';

export abstract class DefaultController<U, V> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    protected constructor(logger: ILogger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: U): Promise<V> {
        throw new ExtendedError('Method must be implemented', HttpStatus.NOT_IMPLEMENTED);
    }

    protected async executeExtended(...params): Promise<V> {
        throw new ExtendedError('Method must be implemented', HttpStatus.NOT_IMPLEMENTED);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async validateRequest(value: U): Promise<U> {
        let items: Array<ValidationError> = await validate(value, this.validatorOptions);
        if (!_.isEmpty(items)) {
            throw new ExtendedError(items.toString(), HttpStatus.BAD_REQUEST, items);
        }
        return value;
    }

    protected get validatorOptions(): ValidatorOptions {
        return { validationError: { target: false } };
    }

    protected async validateResponse(value: V): Promise<V> {
        let items: Array<ValidationError> = await validate(value, this.validatorOptions);
        if (!_.isEmpty(items)) {
            throw new ExtendedError(items.toString(), HttpStatus.INTERNAL_SERVER_ERROR, items);
        }
        return value;
    }
}
