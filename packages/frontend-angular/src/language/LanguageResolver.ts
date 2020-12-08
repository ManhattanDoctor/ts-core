import { Resolve } from '@angular/router';
import { LoadableEvent } from '@ts-core/common';
import { LanguageService } from '@ts-core/frontend/language';
import { PromiseHandler } from '@ts-core/common/promise';

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

        let promise = PromiseHandler.create<void>();
        let subscription = this.language.events.subscribe(data => {
            if (data.type === LoadableEvent.COMPLETE) {
                promise.resolve();
            } else if (data.type === LoadableEvent.ERROR) {
                promise.reject(data.error.toString());
            } else if (data.type === LoadableEvent.FINISHED) {
                subscription.unsubscribe();
            }
        });
        return promise.promise;
    }
}
