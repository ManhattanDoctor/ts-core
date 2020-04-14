import { ArgumentsHost, ExceptionFilter, HttpException, Catch, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import { ValidationError } from 'class-validator';
import * as _ from 'lodash';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: HttpException, host: ArgumentsHost): any {
        let context = host.switchToHttp();
        let response = context.getResponse();

        let message = exception.toString();
        if (_.isArray(exception.message.message)) {
            message = ValidateUtil.toString(exception.message.message);
        }

        let error = new ExtendedError(message, exception.getStatus());
        response.status(error.code).json(TransformUtil.fromClass(error));
    }
}
