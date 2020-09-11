import { ArgumentsHost, Catch, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';

@Catch(ExtendedError)
export class ExtendedErrorFilter implements IExceptionFilter<ExtendedError> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    private static DEFAULT_ERROR = new InternalServerErrorException();

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: ExtendedError, host: ArgumentsHost): any {
        let context = host.switchToHttp();
        let response = context.getResponse();

        exception.code = this.getCode(exception);
        exception.message = this.getMessage(exception);
        exception.details = this.getDetails(exception);

        let status = ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
        if (exception.code in HttpStatus) {
            status = exception.code;
        }

        response.status(status).json(TransformUtil.fromClass(exception));
    }

    public instanceOf(item: any): item is ExtendedError {
        return ExtendedError.instanceOf(item);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getCode(item: ExtendedError): number {
        return !_.isNil(item.code) ? item.code : ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
    }

    protected getMessage(item: ExtendedError): string {
        return !_.isNil(item.message) ? item.message : ExtendedErrorFilter.DEFAULT_ERROR.message;
    }

    protected getDetails(item: ExtendedError): any {
        return item.details;
    }
}
