import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import * as _ from 'lodash';
import { ObjectUtil } from '../../../common/util';

@Catch(Error)
export class DefaultHttpExceptionFilter implements ExceptionFilter<any> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    private static getMessage(exception: any): string {
        if (_.isNil(exception)) {
            return null;
        }
        if (ObjectUtil.instanceOf(exception, ['message'])) {
            return DefaultHttpExceptionFilter.getMessage(exception.message);
        }
        if (ObjectUtil.instanceOf(exception, ['error'])) {
            return DefaultHttpExceptionFilter.getMessage(exception.error);
        }
        return exception;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: any, host: ArgumentsHost) {
        let context = host.switchToHttp();
        let response = context.getResponse();

        let defaultError = new InternalServerErrorException();

        let code = defaultError.getStatus();
        let status = defaultError.getStatus();
        let message = DefaultHttpExceptionFilter.getMessage(exception.message);

        if (ObjectUtil.instanceOf(exception, ['status'])) {
            code = status = exception.status;
        } else if (ObjectUtil.instanceOf(exception, ['code'])) {
            code = exception.code;
            if (code in HttpStatus) {
                status = code;
            }
        }

        if (_.isNil(message)) {
            message = defaultError.message;
        }
        response.status(status).json({ code, message, isError: true });
    }
}
