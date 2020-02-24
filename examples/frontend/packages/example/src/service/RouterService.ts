import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterBaseService } from '@ts-core/frontend-angular';
import { NativeWindowService } from '@ts-core/frontend/service';

@Injectable({ providedIn: 'root' })
export class RouterService extends RouterBaseService {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(router: Router, nativeWindow: NativeWindowService) {
        super(router, nativeWindow);
    }
}
