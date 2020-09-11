import { ExceptionFilter } from '@nestjs/common';

export interface IExceptionFilter<T = any> extends ExceptionFilter<T> {
    instanceOf(item: any): item is T;
}
