import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';

@Catch()
export abstract class AllErrorFilter implements ExceptionFilter<any> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected filters: Array<IExceptionFilter>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(...filters: Array<IExceptionFilter>) {
        this.filters = filters;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected abstract handleException(exception: any, host: ArgumentsHost): any;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: any, host: ArgumentsHost): any {
        if (!_.isEmpty(this.filters)) {
            for (let item of this.filters) {
                if (item.instanceOf(exception)) {
                    return item.catch(exception, host);
                }
            }
        }
        return this.handleException(exception, host);
    }
}
