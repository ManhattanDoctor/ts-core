import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { LoginResolver } from './LoginResolver';

@Injectable({ providedIn: 'root' })
export class LoginRedirectResolver implements CanActivate {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        LoginResolver.redirectUrl = state.url;
        return true;
    }
}
