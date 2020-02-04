import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadableEvent } from '@ts-core/common';
import { LanguageService } from './LanguageService';

@Injectable()
export class LanguageResolver implements Resolve<void> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected language: LanguageService) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public resolve(): Promise<void> {
        if (this.language.isLoaded) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            let subscription: Subscription = this.language.events.subscribe(data => {
                if (data.type === LoadableEvent.COMPLETE) {
                    resolve();
                } else if (data.type === LoadableEvent.ERROR) {
                    reject();
                } else if (data.type === LoadableEvent.FINISHED) {
                    subscription.unsubscribe();
                }
            });
        });
    }
}
