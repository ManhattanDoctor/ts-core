import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { LoginBaseService, LoginBaseServiceEvent } from './LoginBaseService';
import { PromiseHandler } from '@ts-core/common/promise';

export class LoginRequireResolver implements Resolve<void> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected login: LoginBaseService) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<void> {
        if (this.login.isLoggedIn) {
            return Promise.resolve();
        }

        let promise = PromiseHandler.create<void>();
        let subscription = this.login.events.subscribe(data => {
            if (data.type === LoginBaseServiceEvent.LOGIN_ERROR) {
                promise.reject(data.error.toString());
            } else if (data.type === LoginBaseServiceEvent.LOGIN_COMPLETE) {
                promise.resolve();
            } else if (data.type === LoginBaseServiceEvent.LOGIN_FINISHED) {
                subscription.unsubscribe();
            }
        });
        return promise.promise;
    }
}
