import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { LoginBaseService, LoginBaseServiceEvent } from './LoginBaseService';

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
        /*
        if (!this.login.isCanLoginWithSid()) {
            return Promise.reject(`User can't login by sid`);
        }
        */

        return new Promise<void>((resolve, reject) => {
            let subscription = this.login.events.subscribe(data => {
                if (data.type === LoginBaseServiceEvent.LOGIN_ERROR) {
                    reject(data.data.error.message);
                } else if (data.type === LoginBaseServiceEvent.LOGIN_COMPLETE) {
                    resolve();
                } else if (data.type === LoginBaseServiceEvent.LOGIN_FINISHED) {
                    subscription.unsubscribe();
                }
            });
        });
    }
}
