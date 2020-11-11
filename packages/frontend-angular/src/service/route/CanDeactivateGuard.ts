import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { IRouterDeactivatable } from './IRouterDeactivatable';

export class CanDeactivateGuard<T extends IRouterDeactivatable> implements CanDeactivate<T> {
    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public canDeactivate(
        component: IRouterDeactivatable,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return !component.isForceDeactivate ? component.isCanDeactivate(currentRoute, currentState, nextState) : true;
    }
}
