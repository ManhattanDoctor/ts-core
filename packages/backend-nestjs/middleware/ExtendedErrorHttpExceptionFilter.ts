import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ExtendedError } from '@ts-core/common/error';
import { classToPlain } from 'class-transformer';
import * as _ from 'lodash';

@Catch(ExtendedError)
export class ExtendedErrorHttpExceptionFilter implements ExceptionFilter<ExtendedError> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: ExtendedError, host: ArgumentsHost): any {
        let context = host.switchToHttp();
        let response = context.getResponse();

        let defaultError = new InternalServerErrorException();

        let code = exception.code;
        let message = exception.message;

        if (_.isNil(code)) {
            code = defaultError.getStatus();
        }
        if (_.isNil(message)) {
            message = defaultError.message;
        }

        let status = defaultError.getStatus();
        if (code in HttpStatus) {
            status = code;
        }

        response.status(status).json(classToPlain(exception));
    }
}
