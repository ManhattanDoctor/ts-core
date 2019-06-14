import * as _ from 'lodash';
import * as Cookie from 'ngx-cookie';
import { CookieOptionsProvider } from 'ngx-cookie';
import { CookieOptions } from './CookieOptions';

export class CookieService extends Cookie.CookieService {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(options?: CookieOptions) {
        options = _.assign(
            {
                path: '/',
                domain: null,
                expires: null,
                secure: false,
                httpOnly: false
            },
            options
        );
        super({ options } as CookieOptionsProvider);
    }
}
