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

        return new Promise<void>((resolve, reject) => {
            let subscription = this.login.events.subscribe(data => {
                if (data.type === LoginBaseServiceEvent.LOGIN_ERROR) {
                    reject(data.error.message);
                } else if (data.type === LoginBaseServiceEvent.LOGIN_COMPLETE) {
                    resolve();
                } else if (data.type === LoginBaseServiceEvent.LOGIN_FINISHED) {
                    subscription.unsubscribe();
                }
            });
        });
    }
}
