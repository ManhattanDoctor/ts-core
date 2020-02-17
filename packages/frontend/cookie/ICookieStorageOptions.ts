import { ICookieOptions } from './ICookieOptions';
import { ICookieService } from './ICookieService';

export interface ICookieStorageOptions {
    name?: string;
    service?: ICookieService;
    options?: ICookieOptions;
}
