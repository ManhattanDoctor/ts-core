import { ArgumentsHost, HttpException, Catch } from '@nestjs/common';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';

@Catch(HttpException)
export class HttpExceptionFilter implements IExceptionFilter<HttpException> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: HttpException, host: ArgumentsHost): any {
        let context = host.switchToHttp();
        let response = context.getResponse();

        let error = new ExtendedError(this.getMessage(exception), this.getCode(exception), this.getDetails(exception));
        response.status(error.code).json(TransformUtil.fromClass(error));
    }

    public instanceOf(item: any): item is HttpException {
        return item instanceof HttpException;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getCode(item: HttpException): number {
        return item.getStatus();
    }

    protected getMessage(item: HttpException): string {
        return item.toString();
    }

    protected getDetails(item: HttpException): any {
        if (!_.isNil(item.message) && _.isArray(item.message.message)) {
            return item.message.message;
        }
        return null;
    }
}
