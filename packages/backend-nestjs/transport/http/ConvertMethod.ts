import { Method } from 'axios';
import { RequestMethod } from '@nestjs/common';

export function ConvertMethod(method: Method): RequestMethod {
    return RequestMethod[method.toUpperCase()];
}
