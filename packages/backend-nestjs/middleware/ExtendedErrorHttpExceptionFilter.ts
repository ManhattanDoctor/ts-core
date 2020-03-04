import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';
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
        if (_.isNil(exception.code)) {
            exception.code = defaultError.getStatus();
        }
        if (_.isNil(exception.message)) {
            exception.message = defaultError.message;
        }

        let status = defaultError.getStatus();
        if (exception.code in HttpStatus) {
            status = exception.code;
        }

        response.status(status).json(TransformUtil.fromClass(exception));
    }
}
