import { ICookieOptions, ICookieService } from '@ts-core/frontend/cookie';
import * as _ from 'lodash';
import * as Cookie from 'ngx-cookie';
import { CookieOptionsProvider } from 'ngx-cookie';
import { CookieOptions } from './CookieOptions';

export class CookieService extends Cookie.CookieService implements ICookieService {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

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

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public update(key: string, value: string, options?: ICookieOptions): void {
        if (!_.isNil(value)) {
            this.put(key, value, options);
        } else {
            this.remove(key);
        }
    }

    public updateObject(key: string, value: Object, options?: ICookieOptions): void {
        if (!_.isNil(value)) {
            this.putObject(key, value, options);
        } else {
            this.remove(key);
        }
    }
}
