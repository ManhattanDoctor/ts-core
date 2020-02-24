import { Injectable } from '@angular/core';
import { CookieService } from '@ts-core/frontend-angular';
import { SettingsBaseService } from '@ts-core/frontend/service';

@Injectable({ providedIn: 'root' })
export class SettingsService extends SettingsBaseService {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private cookies: CookieService) {
        super();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public get publicKey(): string {
        return this.getValue('publicKey');
    }

    public get socketUrl(): string {
        return this.getValue('socketUrl');
    }
}
