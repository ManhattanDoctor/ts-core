import { ICookieOptions } from '@ts-core/frontend/cookie';
import * as Cookie from 'ngx-cookie';

export class CookieOptions implements ICookieOptions, Cookie.CookieOptions {
    path?: string;
    domain?: string;
    expires?: string | Date;
    secure?: boolean;
    httpOnly?: boolean;
    storeUnencoded?: boolean;
}
