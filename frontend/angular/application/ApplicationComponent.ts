import { ElementRef, Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { LoadableEvent } from '../../../common';
import { ObservableData } from '../../../common/observer';
import { Language } from '../../language';
import { LanguageService, LanguageServiceEvent } from '../language';
import { ViewUtil } from '../util';
import { ApplicationBaseComponent } from './ApplicationBaseComponent';

export abstract class ApplicationComponent extends ApplicationBaseComponent {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private isLanguageLoaded: boolean;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(element: ElementRef, protected language: LanguageService, protected renderer: Renderer2, viewReadyDelay: number = NaN) {
        super(element, viewReadyDelay);
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        ViewUtil.initialize(this.renderer);

        // Language
        this.addSubscription(
            this.language.events.subscribe(data => {
                switch (data.type) {
                    case LoadableEvent.COMPLETE:
                        this.languageLoadingComplete(data);
                        break;
                    case LoadableEvent.ERROR:
                        this.languageLoadingError(data);
                        break;
                }
            })
        );
    }

    protected isReady(): boolean {
        return super.isReady() && this.isLanguageLoaded;
    }
    
    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    protected languageLoadingComplete(data: ObservableData<LanguageServiceEvent | LoadableEvent, Language>): void {
        moment.locale(this.language.locale);
        numeral.locale(this.language.locale);
        this.isLanguageLoaded = true;
        this.checkReady();
    }

    protected languageLoadingError(data: ObservableData<LanguageServiceEvent | LoadableEvent, Language>): void {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Properties
    //
    // --------------------------------------------------------------------------

    protected abstract get config(): any;
}

declare let numeral: any;
