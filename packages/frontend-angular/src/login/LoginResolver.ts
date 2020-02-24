import { Injectable } from '@angular/core';
import { LoginBaseService } from './LoginBaseService';
import { LoginRequireResolver } from './LoginRequireResolver';

@Injectable({ providedIn: 'root' })
export class LoginResolver extends LoginRequireResolver {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public static logoutUrl: string = '/login';
    public static redirectUrl: string = '/';

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(login: LoginBaseService) {
        super(login);
    }
}
